import { Link, useLocation } from 'react-router-dom';
import redbullLogo from '@/assets/redbull-logo.svg';
import { useScoring } from '@/contexts/ScoringContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { PRESET_CONFIG } from '@/lib/scoring';

export function Header() {
  const location = useLocation();
  const { activePreset } = useScoring();
  const { logout, role } = useAuth();

  const showOverallImpression = PRESET_CONFIG[activePreset]?.hasOverallImpression ?? false;

  const navItems = role === 'rider'
    ? [
        { path: '/parameters-guide', label: 'Parameters Guide' },
        { path: '/rider', label: 'Results' },
        { path: '/rider/feedback', label: 'Feedback' },
        { path: '/rider/ranking', label: 'Ranking' },
      ]
    : [
        { path: '/parameters-guide', label: 'Parameters Guide' },
        { path: '/preset', label: 'Event Presets' },
        { path: '/new-score', label: 'New Score' },
        ...(showOverallImpression ? [{ path: '/overall-impression', label: 'Overall Impression' }] : []),
        { path: '/result', label: 'Result' },
        { path: '/rider/ranking', label: 'Ranking' },
      ];

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center gap-5">
            <img src={redbullLogo} alt="Red Bull" className="h-14" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Big Air Scoring System</h1>
        </div>
        
        <nav className="flex items-center justify-between">
          <div className="flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            {role !== 'rider' && (
              <div className="text-sm text-muted-foreground">
                Active Preset: <span className="font-semibold text-foreground">{activePreset}</span>
              </div>
            )}
            <Button
              variant="outline" 
              size="sm" 
              onClick={logout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
