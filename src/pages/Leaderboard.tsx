import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, Star, GitBranch, Coins, Crown, TrendingUp, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Leaderboard = () => {
  const [timeframe, setTimeframe] = useState('all-time');

  const topContributors = [
    {
      rank: 1,
      username: 'alexdev',
      name: 'Alex Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      totalEarnings: 2450,
      prsSubmitted: 89,
      prsAccepted: 76,
      streakDays: 45,
      topLanguages: ['React', 'Node.js', 'Python'],
      badges: ['Top Contributor', 'Quick Resolver', 'Team Player']
    },
    {
      rank: 2,
      username: 'sarahcode',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b642?w=100&h=100&fit=crop&crop=face',
      totalEarnings: 2180,
      prsSubmitted: 67,
      prsAccepted: 61,
      streakDays: 32,
      topLanguages: ['Vue.js', 'TypeScript', 'Go'],
      badges: ['Bug Hunter', 'Documentation Expert']
    },
    {
      rank: 3,
      username: 'mikecodes',
      name: 'Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      totalEarnings: 1950,
      prsSubmitted: 78,
      prsAccepted: 65,
      streakDays: 28,
      topLanguages: ['Python', 'Django', 'PostgreSQL'],
      badges: ['Backend Specialist', 'Performance Optimizer']
    },
    {
      rank: 4,
      username: 'jenniferdx',
      name: 'Jennifer Davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      totalEarnings: 1720,
      prsSubmitted: 54,
      prsAccepted: 48,
      streakDays: 21,
      topLanguages: ['React', 'GraphQL', 'AWS'],
      badges: ['Frontend Master', 'UI/UX Advocate']
    },
    {
      rank: 5,
      username: 'davidrust',
      name: 'David Park',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      totalEarnings: 1540,
      prsSubmitted: 43,
      prsAccepted: 39,
      streakDays: 19,
      topLanguages: ['Rust', 'WebAssembly', 'C++'],
      badges: ['Systems Expert', 'Security Specialist']
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-bold">{rank}</div>;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 border-gray-200 dark:border-gray-800';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Trophy className="h-12 w-12 text-yellow-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Leaderboard
            </h1>
            <p className="text-xl text-muted-foreground">
              Top contributors in the Proof-of-Development ecosystem
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
                <Coins className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">14.7M</div>
                <div className="text-sm text-muted-foreground">Total $DEV Distributed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <GitBranch className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">2,847</div>
                <div className="text-sm text-muted-foreground">PRs Merged This Month</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">+23%</div>
                <div className="text-sm text-muted-foreground">Growth This Month</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold">12,453</div>
                <div className="text-sm text-muted-foreground">Active Contributors</div>
              </CardContent>
            </Card>
          </div>

          {/* Timeframe Tabs */}
          <Tabs value={timeframe} onValueChange={setTimeframe} className="mb-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all-time">All Time</TabsTrigger>
              <TabsTrigger value="monthly">This Month</TabsTrigger>
              <TabsTrigger value="weekly">This Week</TabsTrigger>
              <TabsTrigger value="daily">Today</TabsTrigger>
            </TabsList>

            <TabsContent value={timeframe} className="mt-8">
              {/* Top 3 Podium */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {/* 2nd Place */}
                <Card className={`order-2 md:order-1 ${getRankBgColor(2)}`}>
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      {getRankIcon(2)}
                    </div>
                    <Avatar className="h-20 w-20 mx-auto mb-4">
                      <AvatarImage src={topContributors[1].avatar} alt={topContributors[1].name} />
                      <AvatarFallback>{topContributors[1].name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg">{topContributors[1].name}</CardTitle>
                    <CardDescription>@{topContributors[1].username}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{topContributors[1].totalEarnings} $DEV</div>
                    <div className="text-sm text-muted-foreground mb-4">{topContributors[1].prsAccepted} PRs merged</div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {topContributors[1].badges.slice(0, 2).map((badge, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{badge}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 1st Place */}
                <Card className={`order-1 md:order-2 relative ${getRankBgColor(1)} shadow-lg`}>
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-yellow-500 text-yellow-900">🏆 Champion</Badge>
                  </div>
                  <CardHeader className="text-center pb-4 pt-8">
                    <div className="flex justify-center mb-4">
                      {getRankIcon(1)}
                    </div>
                    <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-yellow-500">
                      <AvatarImage src={topContributors[0].avatar} alt={topContributors[0].name} />
                      <AvatarFallback>{topContributors[0].name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl">{topContributors[0].name}</CardTitle>
                    <CardDescription>@{topContributors[0].username}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">{topContributors[0].totalEarnings} $DEV</div>
                    <div className="text-sm text-muted-foreground mb-4">{topContributors[0].prsAccepted} PRs merged</div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {topContributors[0].badges.slice(0, 3).map((badge, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{badge}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 3rd Place */}
                <Card className={`order-3 ${getRankBgColor(3)}`}>
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      {getRankIcon(3)}
                    </div>
                    <Avatar className="h-20 w-20 mx-auto mb-4">
                      <AvatarImage src={topContributors[2].avatar} alt={topContributors[2].name} />
                      <AvatarFallback>{topContributors[2].name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg">{topContributors[2].name}</CardTitle>
                    <CardDescription>@{topContributors[2].username}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{topContributors[2].totalEarnings} $DEV</div>
                    <div className="text-sm text-muted-foreground mb-4">{topContributors[2].prsAccepted} PRs merged</div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {topContributors[2].badges.slice(0, 2).map((badge, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{badge}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Rest of the leaderboard */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold mb-6">Top Contributors</h3>
                {topContributors.slice(3).map((contributor) => (
                  <Card key={contributor.rank} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg">
                            {getRankIcon(contributor.rank)}
                          </div>
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={contributor.avatar} alt={contributor.name} />
                            <AvatarFallback>{contributor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{contributor.name}</h4>
                            <p className="text-sm text-muted-foreground">@{contributor.username}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-8">
                          <div className="text-right">
                            <div className="font-bold text-primary">{contributor.totalEarnings} $DEV</div>
                            <div className="text-sm text-muted-foreground">{contributor.prsAccepted} PRs merged</div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-medium">{contributor.streakDays} day streak</div>
                            <div className="text-sm text-muted-foreground">Current streak</div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {contributor.topLanguages.slice(0, 2).map((lang, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{lang}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Leaderboard;
