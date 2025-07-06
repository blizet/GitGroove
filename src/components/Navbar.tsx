
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X, Github, Code, Users, Trophy, User, Wallet, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import WalletButton from './ui/walletButton';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navItems = [
    { label: 'Issues', path: '/issues', icon: <Code className="h-4 w-4" /> },
    { label: 'Projects', path: '/projects', icon: <Github className="h-4 w-4" /> },
    { label: 'Leaderboard', path: '/leaderboard', icon: <Trophy className="h-4 w-4" /> },
    { label: 'Community', path: '/community', icon: <Users className="h-4 w-4" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8  rounded-lg flex items-center justify-center">
               <img src="/GitGroove_light.png" alt="logo" className="hidden dark:block" />
               <img src="/GitGroove_dark.png" alt="logo" className="dark:hidden" />
            </div>
            <span className="text-xl font-bold">GitGroove</span>
            <Badge variant="secondary" className="text-xs">Beta</Badge>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" onClick={() => navigate('/auth')}>
              <Github className="h-4 w-4 mr-2" />
              Connect
            </Button>
            <WalletButton/>
            <Button onClick={() => navigate('/dashboard')} className='rounded-full'>
              <User className="h-4 w-4 " />
              
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="py-4 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full text-left px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="border-t border-border pt-4 px-4 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    navigate('/auth');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Github className="h-4 w-4 mr-2" />
                  Connect GitHub
                </Button>
                <Button 
                  className="w-full"
                  onClick={() => {
                    navigate('/dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
