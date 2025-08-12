import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';

interface ScoreEntry {
  name: string;
  wpm: number;
  accuracy: number;
  date: string; // ISO string
}

export default function Leaderboard() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    document.title = 'Leaderboard - TypeTest';
    const key = 'typing-scores';
    try {
      const raw = localStorage.getItem(key);
      const parsed: ScoreEntry[] = raw ? JSON.parse(raw) : [];
      setScores(parsed);
    } catch (e) {
      setScores([]);
    }
  }, []);

  const sorted = useMemo(() => {
    return [...scores].sort((a, b) => b.wpm - a.wpm);
  }, [scores]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-3xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">Top scores saved on this device</p>
        </header>

        <Card className="p-6">
          {sorted.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">No scores yet. Play a round and publish your score!</div>
          ) : (
            <div className="space-y-2">
              {sorted.map((s, i) => (
                <div key={`${s.name}-${s.date}-${i}`} className="grid grid-cols-12 items-center py-3">
                  <div className="col-span-1 text-sm text-muted-foreground">#{i + 1}</div>
                  <div className="col-span-5 font-medium truncate">{s.name}</div>
                  <div className="col-span-2 text-right font-mono">{s.wpm} WPM</div>
                  <div className="col-span-2 text-right text-muted-foreground">{s.accuracy}%</div>
                  <div className="col-span-2 text-right text-muted-foreground">
                    {new Date(s.date).toLocaleDateString()}
                  </div>
                  {i < sorted.length - 1 && (
                    <div className="col-span-12"><Separator className="my-1" /></div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-3 pt-6">
            <Button asChild>
              <Link to="/">Back to Test</Link>
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
