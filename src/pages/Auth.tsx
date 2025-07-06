
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Github, Wallet, Code, Users, ArrowRight, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const Auth = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'contributor' | 'organization'>('contributor');

  const contributorFeatures = [
    'Connect GitHub account',
    'Browse categorized issues',
    'Submit pull requests',
    'Track verification status',
    'Earn $DEV tokens',
    'View contribution history'
  ];

  const organizationFeatures = [
    'Upload projects',
    'Create tagged issues',
    'Set token bounties',
    'Review submissions',
    'Manage project settings',
    'Track pool allocations'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Code className="h-4 w-4 mr-2" />
              Join the Revolution
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your Path
            </h1>
            <p className="text-xl text-muted-foreground">
              Connect your account and start participating in the Proof-of-Development ecosystem
            </p>
          </div>

          {/* Role Selection */}
          <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'contributor' | 'organization')} className="w-full mb-8">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="contributor" className="flex items-center space-x-2">
                <Github className="h-4 w-4" />
                <span>Contributor</span>
              </TabsTrigger>
              <TabsTrigger value="organization" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Organization</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contributor">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <Card className="border-primary/20">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                      <Github className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl">Developer Contributor</CardTitle>
                    <CardDescription className="text-base">
                      Connect your GitHub account and start earning $DEV tokens by contributing to open-source projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {contributorFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() =>{
                        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/github/contributor`;
                      }}
                    >
                      <Github className="h-5 w-5 mr-2" />
                      Connect GitHub Account
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      We'll redirect you to GitHub for secure OAuth authentication
                    </p>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg">How it works</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex space-x-3">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-primary-foreground font-bold">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Browse Issues</h4>
                          <p className="text-sm text-muted-foreground">Find issues that match your skills and interests</p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-primary-foreground font-bold">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Submit PR</h4>
                          <p className="text-sm text-muted-foreground">Create quality pull requests to solve issues</p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-primary-foreground font-bold">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Earn Tokens</h4>
                          <p className="text-sm text-muted-foreground">Get $DEV tokens when your PR is merged</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="organization">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <Card className="border-primary/20">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl">Project Organization</CardTitle>
                    <CardDescription className="text-base">
                      List your open-source projects and leverage the global developer community
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {organizationFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => {
                          window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/github/organization`;
                        }}
                        >
                        <Github className="h-5 w-5 mr-2" />
                        Connect GitHub
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>

                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Connect via GitHub OAuth 
                    </p>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Organization Benefits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex space-x-3">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-primary-foreground font-bold">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Global Talent Pool</h4>
                          <p className="text-sm text-muted-foreground">Access skilled developers worldwide</p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-primary-foreground font-bold">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Quality Assurance</h4>
                          <p className="text-sm text-muted-foreground">Oracle verification ensures code quality</p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-primary-foreground font-bold">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Zero-Cost Development</h4>
                          <p className="text-sm text-muted-foreground">Get quality code without direct payments; only merged work is rewarded externally.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Security Notice */}
          <Card className="mt-8 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Secure Authentication</h4>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    We use OAuth 2.0 for GitHub authentication and industry-standard Web3 wallet connections. 
                    Your credentials are never stored on our servers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Auth;
