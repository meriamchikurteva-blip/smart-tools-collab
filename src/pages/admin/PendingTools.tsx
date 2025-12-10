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
  CheckCircle2,
  ExternalLink,
  Tag,
  User,
  CreditCard
} from 'lucide-react';

interface PendingTool {
  id: string;
  name: string;
  category: string;
  role: string;
  description: string;
  url: string | null;
  pricing: string;
  submitted_by: string;
  created_at: string;
}

const PendingTools = () => {
  const [tools, setTools] = useState<PendingTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingTools();
  }, []);

  const fetchPendingTools = async () => {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTools(data as PendingTool[]);
    }
    setLoading(false);
  };

  const handleApprove = async (toolId: string) => {
    setProcessingId(toolId);
    
    const { error } = await supabase
      .from('tools')
      .update({ status: 'APPROVED', approved_at: new Date().toISOString() })
      .eq('id', toolId);

    if (error) {
      toast({
        title: 'Грешка',
        description: 'Неуспешно одобрение',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Успех',
        description: 'Инструментът е одобрен',
      });
      setTools((prev) => prev.filter((t) => t.id !== toolId));
    }
    setProcessingId(null);
  };

  const handleReject = async (toolId: string) => {
    setProcessingId(toolId);
    
    const { error } = await supabase
      .from('tools')
      .update({ status: 'REJECTED' })
      .eq('id', toolId);

    if (error) {
      toast({
        title: 'Грешка',
        description: 'Неуспешно отхвърляне',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Готово',
        description: 'Инструментът е отхвърлен',
      });
      setTools((prev) => prev.filter((t) => t.id !== toolId));
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
            🔧 Чакащи <span className="text-primary">инструменти</span>
          </h1>
          <p className="text-muted-foreground">
            Преглеждайте и одобрявайте нови AI инструменти
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <Link to="/admin/pending-users">
            <Button variant="secondary" className="gap-2">
              <Users className="h-4 w-4" />
              Чакащи потребители
            </Button>
          </Link>
          <Link to="/admin/pending-tools">
            <Button variant="default" className="gap-2">
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
        ) : tools.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success" />
            <p className="text-lg font-semibold">Няма чакащи инструменти</p>
            <p className="text-muted-foreground">Всички предложения са обработени</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {tools.map((tool) => (
              <div 
                key={tool.id} 
                className="glass-card rounded-2xl p-6 animate-fade-in hover-lift"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold">{tool.name}</h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                    {tool.category}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  {tool.role && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Tag className="h-3 w-3" />
                      {tool.role}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <CreditCard className="h-3 w-3" />
                    {tool.pricing}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {tool.submitted_by}
                  </span>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                </div>

                {tool.url && (
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-sm mb-4"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {tool.url}
                  </a>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                  <Calendar className="h-3 w-3" />
                  Изпратен: {formatDate(tool.created_at)}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="success"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleApprove(tool.id)}
                    disabled={processingId === tool.id}
                  >
                    {processingId === tool.id ? (
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
                    onClick={() => handleReject(tool.id)}
                    disabled={processingId === tool.id}
                  >
                    {processingId === tool.id ? (
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

export default PendingTools;
