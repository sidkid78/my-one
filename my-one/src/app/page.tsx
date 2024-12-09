// app/page.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Brain } from 'lucide-react';
import { ThoughtChain } from '@/components/ThoughtChain';
import { Analysis } from '@/components/Analysis';

interface ThoughtStep {
  thought: string;
  supporting_facts: string[];
  confidence: number;
  next_steps: string[];
}

interface ReasoningChain {
  question: string;
  steps: ThoughtStep[];
  final_answer: string;
  metadata: Record<string, unknown>;
}

export default function Home() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [chain, setChain] = useState<ReasoningChain | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setChain(null);

    try {
      const response = await fetch('/api/cot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      setChain(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Brain className="w-8 h-8" />
        Chain of Thought Reasoning
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question..."
          className="max-w-2xl"
        />
        <Button 
          type="submit" 
          disabled={loading || !question.trim()}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Think
        </Button>
      </form>

      {error && (
        <Card className="p-4 bg-red-50 text-red-700 max-w-2xl">
          {error}
        </Card>
      )}

      {chain && (
        <div className="space-y-8 max-w-4xl">
          <ThoughtChain chain={chain} />
          <Analysis chain={chain} />
        </div>
      )}
    </main>
  );
}