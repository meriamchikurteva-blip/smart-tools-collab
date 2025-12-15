import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  fullName: string;
  type: "registration" | "approval" | "rejection" | "admin_notification";
  approvalToken?: string;
  appUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, type, approvalToken, appUrl }: EmailRequest = await req.json();

    console.log(`Sending ${type} email to ${email}`);

    let subject: string;
    let html: string;
    let toEmail = email;

    switch (type) {
      case "registration":
        subject = "AI Toolbox - Регистрацията ви е получена";
        html = `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #091420; color: #ffffff; padding: 40px; border-radius: 16px;">
            <h1 style="color: #3b82f6; margin-bottom: 24px;">Здравейте, ${fullName}!</h1>
            <p style="color: #b8c5d6; font-size: 16px; line-height: 1.6;">
              Благодарим ви за регистрацията в AI Toolbox!
            </p>
            <p style="color: #b8c5d6; font-size: 16px; line-height: 1.6;">
              Вашата заявка за достъп е получена успешно и в момента очаква одобрение от администратор.
            </p>
            <p style="color: #b8c5d6; font-size: 16px; line-height: 1.6;">
              Ще получите имейл известие, когато статусът на вашия акаунт бъде актуализиран.
            </p>
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #7a8a9e; font-size: 14px;">
                С уважение,<br>
                Екипът на AI Toolbox
              </p>
            </div>
          </div>
        `;
        break;

      case "admin_notification":
        toEmail = "meriamchikurteva@gmail.com";
        subject = `AI Toolbox - Нова заявка за достъп от ${fullName}`;
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const approveUrl = `${supabaseUrl}/functions/v1/approve-user?token=${approvalToken}&action=approve`;
        const rejectUrl = `${supabaseUrl}/functions/v1/approve-user?token=${approvalToken}&action=reject`;
        
        html = `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #091420; color: #ffffff; padding: 40px; border-radius: 16px;">
            <h1 style="color: #3b82f6; margin-bottom: 24px;">Нова заявка за достъп</h1>
            <p style="color: #b8c5d6; font-size: 16px; line-height: 1.6;">
              Потребител е заявил достъп до AI Toolbox:
            </p>
            <div style="background: #243447; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin-bottom: 8px;">${fullName}</p>
              <p style="color: #b8c5d6; font-size: 14px;">${email}</p>
            </div>
            <div style="margin-top: 24px; display: flex; gap: 16px;">
              <a href="${approveUrl}" style="display: inline-block; background: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">✓ Одобри</a>
              <a href="${rejectUrl}" style="display: inline-block; background: #ef4444; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-left: 12px;">✕ Отхвърли</a>
            </div>
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #7a8a9e; font-size: 14px;">
                AI Toolbox Admin Panel
              </p>
            </div>
          </div>
        `;
        break;

      case "approval":
        subject = "AI Toolbox - Акаунтът ви е одобрен!";
        html = `
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
        break;

      case "rejection":
        subject = "AI Toolbox - Заявката ви беше отхвърлена";
        html = `
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
        break;

      default:
        throw new Error("Invalid email type");
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AI Toolbox <onboarding@resend.dev>",
        to: [toEmail],
        subject,
        html,
      }),
    });

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
