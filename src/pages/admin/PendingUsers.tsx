import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Users, 
  Wrench, 
  BookOpen,
  Check, 
  X, 
  Calendar,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface PendingUser {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

const PendingUsers = () => {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, created_at')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const handleApprove = async (userId: string) => {
    setProcessingId(userId);
    
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'APPROVED', approved_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      toast({
        title: 'Грешка',
        description: 'Неуспешно одобрение',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Успех',
        description: 'Потребителят е одобрен',
      });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
    setProcessingId(null);
  };

  const handleReject = async (userId: string) => {
    setProcessingId(userId);
    
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'REJECTED' })
      .eq('id', userId);

    if (error) {
      toast({
        title: 'Грешка',
        description: 'Неуспешно отхвърляне',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Готово',
        description: 'Потребителят е отхвърлен',
      });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
    setProcessingId(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Title */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            👥 Чакащи <span className="text-primary">потребители</span>
          </h1>
          <p className="text-muted-foreground">
            Преглеждайте и одобрявайте нови заявки за достъп
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <Link to="/admin/pending-users">
            <Button variant="default" className="gap-2">
              <Users className="h-4 w-4" />
              Чакащи потребители
            </Button>
          </Link>
          <Link to="/admin/pending-tools">
            <Button variant="secondary" className="gap-2">
              <Wrench className="h-4 w-4" />
              Чакащи инструменти
            </Button>
          </Link>
          <Link to="/tools">
            <Button variant="secondary" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Всички инструменти
            </Button>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">Зареждане...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success" />
            <p className="text-lg font-semibold">Няма чакащи заявки</p>
            <p className="text-muted-foreground">Всички заявки са обработени</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <div 
                key={user.id} 
                className="glass-card rounded-2xl p-6 animate-fade-in hover-lift"
              >
                <h3 className="text-xl font-bold mb-1">{user.full_name}</h3>
                <p className="text-muted-foreground mb-4">{user.email}</p>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                  <Calendar className="h-3 w-3" />
                  Заявка от: {formatDate(user.created_at)}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="success"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleApprove(user.id)}
                    disabled={processingId === user.id}
                  >
                    {processingId === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Одобри
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleReject(user.id)}
                    disabled={processingId === user.id}
                  >
                    {processingId === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <X className="h-4 w-4" />
                        Отхвърли
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PendingUsers;
