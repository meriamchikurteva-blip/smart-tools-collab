import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const action = url.searchParams.get("action") || "approve";

    console.log(`Processing ${action} request with token: ${token}`);

    if (!token) {
      return new Response(
        generateHtmlResponse("error", "Липсва токен за одобрение"),
        { status: 400, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Find user by approval token
    const { data: profile, error: findError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("approval_token", token)
      .maybeSingle();

    if (findError || !profile) {
      console.error("User not found:", findError);
      return new Response(
        generateHtmlResponse("error", "Невалиден или изтекъл токен"),
        { status: 404, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    if (profile.status === "APPROVED") {
      return new Response(
        generateHtmlResponse("info", `${profile.full_name} вече е одобрен`),
        { status: 200, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    const newStatus = action === "reject" ? "REJECTED" : "APPROVED";
    
    // Update user status
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ 
        status: newStatus, 
        approved_at: newStatus === "APPROVED" ? new Date().toISOString() : null,
        approval_token: null // Invalidate token after use
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        generateHtmlResponse("error", "Грешка при обновяване на статуса"),
        { status: 500, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    // Send notification email to user
    try {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "AI Toolbox <onboarding@resend.dev>",
          to: [profile.email],
          subject: newStatus === "APPROVED" 
            ? "AI Toolbox - Акаунтът ви е одобрен!" 
            : "AI Toolbox - Заявката ви беше отхвърлена",
          html: newStatus === "APPROVED" 
            ? generateUserApprovalEmail(profile.full_name)
            : generateUserRejectionEmail(profile.full_name),
        }),
      });
    } catch (emailError) {
      console.error("Failed to send user notification:", emailError);
    }

    const message = newStatus === "APPROVED"
      ? `${profile.full_name} (${profile.email}) е успешно одобрен!`
      : `${profile.full_name} (${profile.email}) е отхвърлен.`;

    return new Response(
      generateHtmlResponse(newStatus === "APPROVED" ? "success" : "rejected", message),
      { status: 200, headers: { "Content-Type": "text/html", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      generateHtmlResponse("error", error.message),
      { status: 500, headers: { "Content-Type": "text/html", ...corsHeaders } }
    );
  }
};

function generateHtmlResponse(type: "success" | "error" | "info" | "rejected", message: string): string {
  const colors = {
    success: { bg: "#10b981", icon: "✓" },
    error: { bg: "#ef4444", icon: "✕" },
    info: { bg: "#3b82f6", icon: "ℹ" },
    rejected: { bg: "#f59e0b", icon: "⊘" },
  };

  const { bg, icon } = colors[type];

  return `
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Toolbox - ${type === "success" ? "Одобрен" : type === "rejected" ? "Отхвърлен" : "Резултат"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #091420;
      color: #ffffff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: #1a2332;
      border-radius: 20px;
      padding: 48px;
      max-width: 480px;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    .icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: ${bg}20;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 40px;
      color: ${bg};
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      color: ${bg};
    }
    p {
      color: #b8c5d6;
      font-size: 16px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${icon}</div>
    <h1>${type === "success" ? "Успешно одобрение" : type === "rejected" ? "Потребителят е отхвърлен" : type === "error" ? "Грешка" : "Информация"}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}

function generateUserApprovalEmail(fullName: string): string {
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #091420; color: #ffffff; padding: 40px; border-radius: 16px;">
      <h1 style="color: #10b981; margin-bottom: 24px;">Добре дошли, ${fullName}!</h1>
      <p style="color: #b8c5d6; font-size: 16px; line-height: 1.6;">
        Чудесни новини! Вашият акаунт в AI Toolbox беше одобрен.
      </p>
      <p style="color: #b8c5d6; font-size: 16px; line-height: 1.6;">
        Вече можете да влезете в системата и да започнете да използвате всички функции на платформата.
      </p>
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
        <p style="color: #7a8a9e; font-size: 14px;">
          С уважение,<br>
          Екипът на AI Toolbox
        </p>
      </div>
    </div>
  `;
}

function generateUserRejectionEmail(fullName: string): string {
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #091420; color: #ffffff; padding: 40px; border-radius: 16px;">
      <h1 style="color: #ef4444; margin-bottom: 24px;">Здравейте, ${fullName}</h1>
      <p style="color: #b8c5d6; font-size: 16px; line-height: 1.6;">
        За съжаление, вашата заявка за достъп до AI Toolbox беше отхвърлена.
      </p>
      <p style="color: #b8c5d6; font-size: 16px; line-height: 1.6;">
        Ако смятате, че това е грешка, моля свържете се с администратора.
      </p>
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
        <p style="color: #7a8a9e; font-size: 14px;">
          С уважение,<br>
          Екипът на AI Toolbox
        </p>
      </div>
    </div>
  `;
}

serve(handler);
