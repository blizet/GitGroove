
import React from 'react';
import { Code, Github, Twitter, MessageCircle, Book, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    product: [
      { label: 'How it Works', href: '#' },
      { label: 'Issues', href: '/issues' },
      { label: 'Projects', href: '/projects' },
      { label: 'Leaderboard', href: '/leaderboard' },
    ],
    developers: [
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'GitHub', href: '#' },
      { label: 'Smart Contracts', href: '#' },
    ],
    community: [
      { label: 'Discord', href: '#' },
      { label: 'Twitter', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Forum', href: '#' },
    ],
    company: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: <Github className="h-5 w-5" />, href: '#', label: 'GitHub' },
    { icon: <Twitter className="h-5 w-5" />, href: '#', label: 'Twitter' },
    { icon: <MessageCircle className="h-5 w-5" />, href: '#', label: 'Discord' },
  ];

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                 <img src="/GitGroove_light.png" alt="logo" className="hidden dark:block" />
               <img src="/GitGroove_dark.png" alt="logo" className="dark:hidden" />
              </div>
              <span className="text-xl font-bold">GitGroove</span>
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              The revolutionary blockchain where open-source contributions replace traditional mining. 
              Every line of code matters.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Developers</h3>
            <ul className="space-y-3">
              {links.developers.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-3">
              {links.community.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {links.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            © {currentYear} Proof-of-Development. Built with{' '}
            <Heart className="h-4 w-4 inline mx-1 text-red-500" />
            by the open-source community.
          </p>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span>Powered by Filecoin, Reppo & Ethereum</span>
            <Badge variant="outline" className="text-xs">
              <Book className="h-3 w-3 mr-1" />
              MIT License
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
