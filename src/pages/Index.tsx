import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Wrench, LogIn, UserPlus, Sparkles, Shield, Zap } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Logo */}
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-primary/20 flex items-center justify-center shadow-glow">
            <Wrench className="h-10 w-10 text-primary" />
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            AI <span className="text-primary">Toolbox</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Вътрешна система за управление на AI инструменти. 
            Откривайте, споделяйте и използвайте най-добрите AI решения.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              variant="hero"
              size="xl"
              onClick={() => navigate('/login')}
              className="gap-3"
            >
              <LogIn className="h-5 w-5" />
              Вход
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() => navigate('/register')}
              className="gap-3"
            >
              <UserPlus className="h-5 w-5" />
              Заявка за достъп
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="glass-card rounded-2xl p-6 hover-lift">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Откриване на AI</h3>
              <p className="text-muted-foreground text-sm">
                Разглеждайте одобрена колекция от AI инструменти за всяка нужда.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 hover-lift">
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-bold text-lg mb-2">Бързо предложение</h3>
              <p className="text-muted-foreground text-sm">
                Предлагайте нови инструменти и допринасяйте за растежа на библиотеката.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 hover-lift">
              <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="font-bold text-lg mb-2">Контролиран достъп</h3>
              <p className="text-muted-foreground text-sm">
                Администраторите преглеждат и одобряват всички заявки и предложения.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
        © 2024 AI Toolbox. Вътрешна система за управление.
      </footer>
    </div>
  );
};

export default Index;
