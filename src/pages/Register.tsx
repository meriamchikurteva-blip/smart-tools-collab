import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Wrench, UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Името трябва да е поне 2 символа').max(100, 'Името е твърде дълго'),
  email: z.string().email('Невалиден имейл адрес').max(255, 'Имейлът е твърде дълъг'),
  password: z.string().min(6, 'Паролата трябва да е поне 6 символа'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Паролите не съвпадат',
  path: ['confirmPassword'],
});

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = registerSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    const { error, approvalToken } = await signUp(email, password, fullName);

    if (error) {
      if (error.message.includes('already registered')) {
        toast({
          title: 'Грешка',
          description: 'Този имейл вече е регистриран',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Грешка при регистрация',
          description: error.message,
          variant: 'destructive',
        });
      }
      setLoading(false);
      return;
    }

    // Send confirmation email to user
    try {
      await supabase.functions.invoke('send-confirmation-email', {
        body: { email, fullName, type: 'registration' }
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    // Send admin notification with approval link
    if (approvalToken) {
      try {
        await supabase.functions.invoke('send-confirmation-email', {
          body: { 
            email, 
            fullName, 
            type: 'admin_notification',
            approvalToken,
            appUrl: window.location.origin
          }
        });
      } catch (adminEmailError) {
        console.error('Failed to send admin notification:', adminEmailError);
      }
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md animate-fade-in">
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Заявката е изпратена!</h1>
            <p className="text-muted-foreground mb-6">
              Вашата заявка за достъп е успешно изпратена. Ще получите известие по имейл след одобрение от администратор.
            </p>
            <p className="text-xs text-muted-foreground mb-8">
              Администратор: meriamchikurteva@gmail.com
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Към страницата за вход
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <span className="font-bold text-xl">AI Toolbox</span>
        </Link>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-center mb-2">Заявка за достъп</h1>
          <p className="text-muted-foreground text-center mb-8">
            Попълнете формуляра за да заявите достъп
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Пълно име</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Иван Иванов"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Имейл</Label>
              <Input
                id="email"
                type="email"
                placeholder="вашият@имейл.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Парола</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Потвърдете паролата</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Изпрати заявка
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Вече имате акаунт?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Вход
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
