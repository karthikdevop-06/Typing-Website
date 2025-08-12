import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Link } from 'wouter';
import { RotateCcw, Clock, Target, TrendingUp, CheckCircle } from 'lucide-react';
interface TypingStats {
  wpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  totalWords: number;
}

const WORD_LIST = [
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'and', 'runs', 'away', 'fast',
  'computer', 'keyboard', 'typing', 'speed', 'test', 'words', 'practice', 'skill', 'accuracy',
  'development', 'programming', 'javascript', 'react', 'component', 'function', 'variable',
  'beautiful', 'amazing', 'wonderful', 'fantastic', 'incredible', 'spectacular', 'magnificent',
  'challenge', 'improvement', 'progress', 'achievement', 'success', 'determination', 'focus',
  'concentration', 'dedication', 'persistence', 'excellence', 'mastery', 'precision', 'fluency',
];

const TIMER_OPTIONS = [15, 30, 60];

export default function TypingTest() {
  const [selectedTime, setSelectedTime] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(selectedTime);
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [completedWords, setCompletedWords] = useState<{ word: string; typed: string; correct: boolean; correctChars: number }[]>([]);
  const [stats, setStats] = useState<TypingStats | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);

  const [publishPromptOpen, setPublishPromptOpen] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [playerName, setPlayerName] = useState('');
  // Generate random words
  const generateWords = useCallback(() => {
    const randomWords = [];
    for (let i = 0; i < 200; i++) {
      randomWords.push(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
    }
    setWords(randomWords);
  }, []);

  // Initialize words on mount
  useEffect(() => {
    generateWords();
  }, [generateWords]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      finishTest();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (!wordsContainerRef.current) return;
    const el = wordsContainerRef.current.querySelector(`#word-${currentWordIndex}`) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  }, [currentWordIndex]);

  useEffect(() => {
    if (stats) {
      setPublishPromptOpen(true);
    }
  }, [stats]);

  const startTest = () => {
    setIsActive(true);
    setTimeLeft(selectedTime);
    setCurrentWordIndex(0);
    setCurrentInput('');
    setCompletedWords([]);
    setStats(null);
    generateWords();
    inputRef.current?.focus();
    wordsContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finishTest = () => {
    setIsActive(false);
    calculateStats();
  };

  const calculateStats = () => {
    const totalTime = selectedTime / 60; // Convert to minutes
    const correctChars = completedWords.reduce((sum, w) => sum + (w.correctChars || 0), 0);
    const correctWords = completedWords.filter(w => w.correct).length;
    const incorrectWords = completedWords.filter(w => !w.correct).length;
    const totalWords = completedWords.length;
    
    const wpm = Math.round((correctChars / 5) / totalTime);
    const accuracy = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0;

    setStats({
      wpm,
      accuracy,
      correctWords,
      incorrectWords,
      totalWords,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive) return;
    
    const value = e.target.value;
    
    if (value.endsWith(' ')) {
      // Word completed
      const typedWord = value.trim();
      const currentWord = words[currentWordIndex];
      const isCorrect = typedWord === currentWord;

      // count correct characters at matching positions
      let correctChars = 0;
      const minLen = Math.min(typedWord.length, currentWord.length);
      for (let i = 0; i < minLen; i++) {
        if (typedWord[i] === currentWord[i]) correctChars++;
      }
      
      setCompletedWords(prev => [
        ...prev,
        { word: currentWord, typed: typedWord, correct: isCorrect, correctChars }
      ]);
      setCurrentWordIndex(prev => prev + 1);
      setCurrentInput('');
    } else {
      setCurrentInput(value);
    }
  };

  const resetTest = () => {
    setIsActive(false);
    setTimeLeft(selectedTime);
    setCurrentWordIndex(0);
    setCurrentInput('');
    setCompletedWords([]);
    setStats(null);
    generateWords();
    wordsContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveScore = (name: string) => {
    if (!stats) return;
    const entry = {
      name,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      date: new Date().toISOString(),
    };
    const key = 'typing-scores';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(entry);
    localStorage.setItem(key, JSON.stringify(existing));
  };

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">TypeTest</h1>
          <p className="text-muted-foreground">Test your typing speed and accuracy</p>
        </div>

        {/* Timer Selection */}
        {!isActive && !stats && (
          <div className="flex justify-center gap-3">
            {TIMER_OPTIONS.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                onClick={() => {
                  setSelectedTime(time);
                  setTimeLeft(time);
                }}
                className="min-w-[80px]"
              >
                {time}s
              </Button>
            ))}
          </div>
        )}

        {/* Timer Display */}
        {(isActive || stats) && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-2xl font-mono font-bold">
              <Clock className="w-6 h-6" />
              {formatTime(timeLeft)}
            </div>
          </div>
        )}

        {/* Typing Area */}
        {!stats && (
          <Card className="p-8">
            <div className="space-y-6">
              {/* Words Display */}
              <div
                ref={wordsContainerRef}
                className="typing-text leading-relaxed h-[10rem] p-4 rounded-lg bg-muted/30 overflow-y-auto no-scrollbar"
              >
                {words.map((word, index) => {
                  let className = 'word-transition inline-block px-1 py-0.5 mx-1 rounded';

                  if (index < currentWordIndex) {
                    // Completed word
                    const completed = completedWords[index];
                    className += completed?.correct ? ' word-correct' : ' word-incorrect';
                  } else if (index === currentWordIndex) {
                    // Current word
                    className += ' word-current';
                  } else {
                    // Pending word
                    className += ' word-pending';
                  }

                  return (
                    <span id={`word-${index}`} key={`${word}-${index}`} className={className}>
                      {word}
                    </span>
                  );
                })}
              </div>

              {/* Input */}
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={handleInputChange}
                  disabled={!isActive && timeLeft === selectedTime}
                  placeholder={isActive ? "Type here..." : "Click start to begin"}
                  className="w-full p-4 text-xl font-mono bg-background border-2 border-border rounded-lg focus:border-ring focus:outline-none disabled:opacity-50"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
                {isActive && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-foreground typing-cursor"></div>
                )}
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                {!isActive && timeLeft === selectedTime && (
                  <Button onClick={startTest} size="lg" className="min-w-[120px]">
                    Start Test
                  </Button>
                )}
                {(isActive || timeLeft !== selectedTime) && (
                  <Button onClick={resetTest} variant="outline" size="lg">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Results */}
        {stats && (
          <Card className="p-8 stats-enter">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-success">
                  <CheckCircle className="w-8 h-8" />
                  Test Complete!
                </div>
                <p className="text-muted-foreground">Great job! Here are your results:</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    WPM
                  </div>
                  <div className="text-3xl font-bold">{stats.wpm}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Target className="w-4 h-4" />
                    Accuracy
                  </div>
                  <div className="text-3xl font-bold">{stats.accuracy}%</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-muted-foreground">Correct</div>
                  <div className="text-3xl font-bold text-success">{stats.correctWords}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-muted-foreground">Incorrect</div>
                  <div className="text-3xl font-bold text-destructive">{stats.incorrectWords}</div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Button onClick={resetTest} size="lg">
                  Try Again
                </Button>
                <Button 
                  onClick={() => {
                    resetTest();
                    setSelectedTime(30);
                  }} 
                  variant="outline" 
                  size="lg"
                >
                  Change Time
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/leaderboard">View Leaderboard</Link>
                </Button>
              </div>

              <AlertDialog open={publishPromptOpen} onOpenChange={setPublishPromptOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Publish your score?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Share your WPM and accuracy on the local leaderboard.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No thanks</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        setPublishPromptOpen(false);
                        setNameDialogOpen(true);
                      }}
                    >
                      Yes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Enter your name</DialogTitle>
                    <DialogDescription>Your score will be saved to this device.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Input
                      placeholder="Your name"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNameDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (playerName.trim()) {
                          saveScore(playerName.trim());
                          setNameDialogOpen(false);
                        }
                      }}
                    >
                      Save score
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}