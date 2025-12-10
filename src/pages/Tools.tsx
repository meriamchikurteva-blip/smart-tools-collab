import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Plus, 
  ExternalLink, 
  Wrench, 
  FolderOpen, 
  Clock,
  ChevronDown
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Tool {
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

const CATEGORIES = [
  'Всички',
  'Chat AI',
  'Image Generation',
  'Video Generation',
  'Code Assistant',
  'Audio/Music',
  'Writing',
  'Other',
];

const Tools = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Всички');
  const [sortBy, setSortBy] = useState('name-asc');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTools();
  }, []);

  useEffect(() => {
    filterAndSortTools();
  }, [tools, searchQuery, selectedCategory, sortBy]);

  const fetchTools = async () => {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('status', 'APPROVED');

    if (!error && data) {
      setTools(data as Tool[]);
    }
    setLoading(false);
  };

  const filterAndSortTools = () => {
    let result = [...tools];

    // Filter by search
    if (searchQuery) {
      result = result.filter((tool) =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'Всички') {
      result = result.filter((tool) => tool.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'category-asc':
        result.sort((a, b) => a.category.localeCompare(b.category));
        break;
    }

    setFilteredTools(result);
  };

  const uniqueCategories = [...new Set(tools.map((t) => t.category))];
  const lastAddedTool = tools.length > 0 
    ? tools.reduce((a, b) => new Date(a.created_at) > new Date(b.created_at) ? a : b)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Title */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            AI Toolbox <span className="text-primary">Library</span>
          </h1>
          <p className="text-muted-foreground">
            Откривайте, споделяйте и използвайте най-добрите AI решения (само одобрени)
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Общо инструменти</p>
              <p className="text-2xl font-bold">{tools.length}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Категории</p>
              <p className="text-2xl font-bold">{uniqueCategories.length}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Последно добавен</p>
              <p className="text-lg font-bold truncate max-w-[180px]">
                {lastAddedTool?.name || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Търсене по име на инструмент..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px] bg-input border-border">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px] bg-input border-border">
              <SelectValue placeholder="Сортиране" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="name-asc">Име (А-Я)</SelectItem>
              <SelectItem value="name-desc">Име (Я-А)</SelectItem>
              <SelectItem value="category-asc">Категория (А-Я)</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => navigate('/tools/add')} className="gap-2">
            <Plus className="h-4 w-4" />
            Добави инструмент
          </Button>
        </div>

        {/* Tools Table */}
        {loading ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">Зареждане...</p>
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Няма намерени инструменти</p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Име</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Категория</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground hidden md:table-cell">Описание</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Линк</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground hidden lg:table-cell">Изпратен от</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTools.map((tool) => (
                    <tr key={tool.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <span className="font-semibold">{tool.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                          {tool.category}
                        </span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                          {tool.description}
                        </p>
                      </td>
                      <td className="p-4">
                        {tool.url ? (
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                          >
                            Посети <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground italic">
                          {tool.submitted_by}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Tools;
