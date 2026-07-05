import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import wooLogo from '@/assets/woo-logo.svg';
import capitalLogo from '@/assets/capital-com-logo.png';

const Login = () => {
  const [role, setRole] = useState<UserRole>('judge');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const success = login(email, password, role);
    if (success) {
      navigate(role === 'rider' ? '/rider' : '/parameters-guide');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <Link to="/" className="flex items-center justify-center gap-4 mb-6">
            <img src={wooLogo}     alt="Woo"         className="h-8" style={{ filter: 'brightness(0) invert(1)' }} />
            <div className="w-px h-6 bg-border" />
            <img src={capitalLogo} alt="Capital.com" className="h-6" style={{ filter: 'brightness(0) invert(1)' }} />
          </Link>

          <h1 className="text-2xl font-bold text-center text-foreground mb-6">
            Big Air Scoring System
          </h1>

          <div className="flex bg-muted rounded-full p-1 mb-6">
            <button
              type="button"
              onClick={() => setRole('judge')}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${
                role === 'judge' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              Judge
            </button>
            <button
              type="button"
              onClick={() => setRole('rider')}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${
                role === 'rider' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              Rider
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="mt-1"
              />
            </div>

            {error && (
              <div className="text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
