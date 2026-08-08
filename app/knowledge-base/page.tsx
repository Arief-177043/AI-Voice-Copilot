'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen, ShieldCheck, AlertTriangle, CheckCircle2, Clock, Tag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAllKnowledge } from '@/lib/rag';
import type { KnowledgeEntry, KnowledgeCategory } from '@/lib/types';

const categoryConfig: Record<KnowledgeCategory, { label: string; icon: typeof BookOpen; color: string }> = {
  product_info: { label: 'Product Info', icon: BookOpen, color: 'text-primary' },
  eligibility: { label: 'Eligibility', icon: CheckCircle2, color: 'text-success' },
  kyc: { label: 'KYC', icon: ShieldCheck, color: 'text-primary' },
  faq: { label: 'FAQs', icon: BookOpen, color: 'text-muted-foreground' },
  approved_language: { label: 'Approved Language', icon: CheckCircle2, color: 'text-success' },
  prohibited_claims: { label: 'Prohibited Claims', icon: AlertTriangle, color: 'text-destructive' },
  pricing: { label: 'Pricing', icon: Tag, color: 'text-warning' },
  compliance: { label: 'Compliance', icon: ShieldCheck, color: 'text-primary' },
};

export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [filtered, setFiltered] = useState<KnowledgeEntry[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<KnowledgeCategory | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getAllKnowledge();
      setEntries(data);
      setFiltered(data);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    let result = entries;
    if (activeCategory !== 'all') {
      result = result.filter((e) => e.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) =>
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }
    setFiltered(result);
  }, [search, activeCategory, entries]);

  const categories = Object.keys(categoryConfig) as KnowledgeCategory[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Approved product information powering the RAG agent. Versioned and compliance-checked.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Input
          placeholder="Search knowledge base..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:max-w-sm"
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          All responses grounded in v2.1 • Effective Jan 15, 2025
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            activeCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          All ({entries.length})
        </button>
        {categories.map((cat) => {
          const count = entries.filter((e) => e.category === cat).length;
          if (count === 0) return null;
          const cfg = categoryConfig[cat];
          const Icon = cfg.icon;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3 w-3" />
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      <ScrollArea className="h-[calc(100vh-380px)] min-h-[400px] pr-4 scrollbar-thin">
        <div className="grid md:grid-cols-2 gap-4">
          {loading ? (
            <p className="text-sm text-muted-foreground col-span-2 text-center py-12">Loading knowledge base...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground col-span-2 text-center py-12">No entries found.</p>
          ) : (
            filtered.map((entry) => {
              const cfg = categoryConfig[entry.category];
              const Icon = cfg.icon;
              const isProhibited = entry.category === 'prohibited_claims';
              return (
                <Card key={entry.id} className={isProhibited ? 'border-destructive/30' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${cfg.color}`} />
                        <CardTitle className="text-sm">{entry.title}</CardTitle>
                      </div>
                      <Badge variant="outline" className={`text-xs shrink-0 ${isProhibited ? 'border-destructive/40 text-destructive' : ''}`}>
                        {cfg.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className={`text-sm leading-relaxed ${isProhibited ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {entry.content}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {entry.keywords.slice(0, 5).map((kw) => (
                        <Badge key={kw} variant="secondary" className="text-xs font-normal">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {entry.version}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(entry.effective_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
