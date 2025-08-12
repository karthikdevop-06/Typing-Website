import TypingTest from '@/components/TypingTest';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const Index = () => {
  return (
    <>
      <Button asChild className="fixed top-4 right-16 z-50" variant="secondary" size="sm">
        <Link to="/leaderboard">Leaderboard</Link>
      </Button>
      <ThemeToggle />
      <TypingTest />
    </>
  );
};

export default Index;
