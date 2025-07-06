
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Github, Code, Coins, Shield, Users, Zap, ChevronRight, Star, GitBranch, Blocks } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Code className="h-6 w-6" />,
      title: "Contribute & Earn",
      description: "Submit PRs to earn $DEV tokens while contributing to open-source projects"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Proof-of-Development",
      description: "Revolutionary consensus mechanism where code contributions validate transactions"
    },
    {
      icon: <Coins className="h-6 w-6" />,
      title: "Instant Rewards",
      description: "Get rewarded immediately when your PR is merged and verified by Oracle"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Global Community",
      description: "Join thousands of developers contributing to the decentralized future"
    }
  ];

  const stats = [
    { label: "Active Contributors", value: "12,453", icon: <Users className="h-5 w-5" /> },
    { label: "Issues Resolved", value: "89,234", icon: <GitBranch className="h-5 w-5" /> },
    { label: "$DEV Distributed", value: "2.4M", icon: <Coins className="h-5 w-5" /> },
    { label: "Projects Listed", value: "1,847", icon: <Blocks className="h-5 w-5" /> }
  ];

  return (
    <div className="bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32">
        
        <div className="container mx-auto px-4 pt-20 py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Star className="h-4 w-4 mr-2" />
              Revolutionary Consensus Mechanism
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Proof-of-Development
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              The first blockchain where <span className="text-primary font-semibold">open-source contributions</span> replace traditional mining. 
              Code commits become block validators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" onClick={() => navigate('/auth')}  className="px-8 py-3 text-lg cursor-pointer">
                <Github className="h-5 w-5 mr-2" />
                Start Contributing
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/projects')} className="px-8 py-3 text-lg">
                <Zap className="h-5 w-5 mr-2" />
                List Your Project
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              {stats.map((stat, index) => (
                <Card key={index} className="border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-2 text-primary">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How Proof-of-Development Works</h2>
              <p className="text-xl text-muted-foreground">
                A revolutionary consensus mechanism powered by open-source contributions
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="relative group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                    <span className="text-primary-foreground font-bold text-lg">1</span>
                  </div>
                  <CardTitle>Browse & Contribute</CardTitle>
                  <CardDescription>
                    Connect your GitHub account, browse categorized issues, and submit quality pull requests
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="relative group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                    <span className="text-primary-foreground font-bold text-lg">2</span>
                  </div>
                  <CardTitle>Oracle Verification</CardTitle>
                  <CardDescription>
                    Your merged PR gets verified by our Oracle system and stored on Filecoin with a unique CID
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="relative group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                    <span className="text-primary-foreground font-bold text-lg">3</span>
                  </div>
                  <CardTitle>Earn $DEV Tokens</CardTitle>
                  <CardDescription>
                    Receive instant $DEV token rewards while your contribution validates the next block
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose PoD?</h2>
              <p className="text-xl text-muted-foreground">
                The future of blockchain consensus is here
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Ready to Shape the Future?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join the revolution where every line of code matters. Start contributing today and earn while you build the decentralized future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="invert" onClick={() => navigate('/auth')} className="px-8 py-3 text-lg">
                <Github className="h-5 w-5 mr-2" />
                Connect GitHub
              </Button>
              <Button size="lg" variant="invert" onClick={() => navigate('/leaderboard')} className="px-8 py-3 text-lg">
                View Leaderboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
