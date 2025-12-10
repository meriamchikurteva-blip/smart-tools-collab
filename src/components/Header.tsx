import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield, Wrench } from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => navigate('/tools')}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Wrench className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-lg">AI Toolbox</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">
            👤 {profile?.email}
          </span>

          {isAdmin && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/admin/pending-users')}
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Админ панел</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Изход</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
