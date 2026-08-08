import { supabase } from './supabase';
import type { KnowledgeEntry, RAGResult } from './types';

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter((w) => w.length > 1);
}

function calculateRelevance(query: string, entry: KnowledgeEntry): number {
  const queryTokens = tokenize(query);
  const entryText = `${entry.title} ${entry.content} ${entry.keywords.join(' ')}`.toLowerCase();
  const entryTokens = tokenize(entryText);
  const entryTokenSet = new Set(entryTokens);

  let score = 0;
  for (const qt of queryTokens) {
    if (entry.keywords.some((k) => k.toLowerCase().includes(qt) || qt.includes(k.toLowerCase()))) {
      score += 3;
    }
    if (entryTokenSet.has(qt)) {
      score += 1;
    }
  }
  if (entry.category === 'prohibited_claims' || entry.category === 'compliance') {
    score *= 0.7;
  }
  return score;
}

export async function ragSearch(query: string, limit: number = 3): Promise<RAGResult[]> {
  const { data, error } = await supabase.from('knowledge_base').select('*').eq('is_active', true);
  if (error || !data) {
    console.error('RAG search error:', error);
    return [];
  }
  const entries = data as KnowledgeEntry[];
  const scored = entries
    .map((entry) => ({ entry, score: calculateRelevance(query, entry) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((s) => ({
    title: s.entry.title,
    content: s.entry.content,
    source: `Knowledge Base: ${s.entry.title}`,
    version: s.entry.version,
    score: s.score,
    category: s.entry.category,
  }));
}

export async function getAllKnowledge(): Promise<KnowledgeEntry[]> {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('title', { ascending: true });
  if (error || !data) return [];
  return data as KnowledgeEntry[];
}
