import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  Loader2, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from 'zod';

const CATEGORIES = [
  'Chat AI',
  'Image Generation',
  'Video Generation',
  'Code Assistant',
  'Audio/Music',
  'Writing',
  'Other',
];

const ROLES = [
  'Marketing',
  'Development',
  'Design',
  'Content Creation',
  'Business',
  'Education',
  'Productivity',
];

const PRICING = ['Free', 'Freemium', 'Paid'];

const toolSchema = z.object({
  name: z.string().min(2, 'Името трябва да е поне 2 символа').max(100, 'Името е твърде дълго'),
  category: z.string().min(1, 'Изберете категория'),
  role: z.string().min(1, 'Изберете роля'),
  description: z.string().min(10, 'Описанието трябва да е поне 10 символа').max(1000, 'Описанието е твърде дълго'),
  url: z.string().url('Невалиден URL адрес').optional().or(z.literal('')),
  pricing: z.string().min(1, 'Изберете тип лиценз'),
});

const AddTool = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    role: '',
    description: '',
    url: '',
    pricing: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = toolSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('tools').insert({
      name: formData.name,
      category: formData.category,
      role: formData.role,
      description: formData.description,
      url: formData.url || null,
      pricing: formData.pricing,
      submitted_by: profile?.email || '',
      status: 'PENDING',
    });

    if (error) {
      toast({
        title: 'Грешка',
        description: 'Неуспешно добавяне на инструмент',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    setSuccess(true);
    setFormData({
      name: '',
      category: '',
      role: '',
      description: '',
      url: '',
      pricing: '',
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <Link 
          to="/tools" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад към инструментите
        </Link>

        <div className="glass-card rounded-2xl p-8 animate-fade-in">
          <h1 className="text-2xl font-bold mb-2">Добави нов AI инструмент</h1>
          <p className="text-muted-foreground mb-8">
            Предложете инструмент за добавяне в библиотеката
          </p>

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-success">Заявката е изпратена успешно!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Администраторът (meriamchikurteva@gmail.com) ще прегледа предложението и ще получите известие.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Вашият имейл</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="opacity-60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Име на инструмента *</Label>
              <Input
                id="name"
                placeholder="Напр. ChatGPT, Midjourney..."
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Категория *</Label>
                <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Изберете категория" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Роля *</Label>
                <Select value={formData.role} onValueChange={(v) => handleChange('role', v)}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Изберете роля" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-xs text-destructive">{errors.role}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание *</Label>
              <Textarea
                id="description"
                placeholder="Опишете какво прави този инструмент..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={loading}
                rows={4}
                className="resize-none"
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL адрес (незадължително)</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => handleChange('url', e.target.value)}
                disabled={loading}
              />
              {errors.url && (
                <p className="text-xs text-destructive">{errors.url}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Тип лиценз *</Label>
              <Select value={formData.pricing} onValueChange={(v) => handleChange('pricing', v)}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Изберете тип лиценз" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {PRICING.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.pricing && (
                <p className="text-xs text-destructive">{errors.pricing}</p>
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
                  <Plus className="h-4 w-4" />
                  Изпрати за одобрение
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/tools" className="text-primary hover:underline">
              Виж одобрените инструменти →
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default AddTool;
