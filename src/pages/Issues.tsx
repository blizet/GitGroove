import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Search, Coins, Eye, Star, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IssueItem {
  id: number;
  number: number;
  title: string;
  description: string;
  difficulty: string;
  language: string;
  project: string;
  bounty: number;
  timeEstimate: string;
  applicants: number;
  tags: string[];
  createdAt: string;
  url: string;
  state: 'open' | 'closed' | 'assigned';
  repo_url: string;
  comments: number;
  assignee: string | null;
  linked_transaction?: {
    txHash: string;
    amount: number;
    currency: string;
  };
}

const Issues = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'closed' | 'assigned'>('all');

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('github_token');
        if (!token) {
          setError('No auth token found. Please login.');
          setLoading(false);
          return;
        }

        const url = new URL(`${import.meta.env.VITE_BACKEND_URL}/api/issues/classified`);
        url.searchParams.append('token', token);

        const response = await axios.get(url.toString());
        const data = response.data;

        if (Array.isArray(data)) {
          const mappedIssues = data.map((issue: any) => ({
            id: issue.id,
            number: issue.number,
            title: issue.title,
            description: issue.body || '',
            difficulty: issue.difficulty || 'Medium',
            language: issue.language || 'Unknown',
            project: issue.repo_name || 'Unknown',
            bounty: issue.bounty || 0,
            timeEstimate: issue.time_estimate || 'N/A',
            applicants: issue.applicants || 0,
            tags: issue.labels || [],
            createdAt: new Date(issue.created_at).toLocaleString(),
            url: issue.html_url,
            state: issue.state || 'open',
            repo_url: issue.repo_url || '',
            comments: issue.comments || 0,
            assignee: issue.assignee || null,
            linked_transaction: issue.linked_transaction
          }));

          // Sort issues: open funded → open unfunded → assigned → closed
          const sortedIssues = [...mappedIssues].sort((a, b) => {
            // Status priority
            const statusOrder = { open: 1, assigned: 2, closed: 3 };
            if (statusOrder[a.state] !== statusOrder[b.state]) {
              return statusOrder[a.state] - statusOrder[b.state];
            }

            // Funding amount (tx-funded first, then bounty)
            const aFunding = a.linked_transaction?.amount || a.bounty || 0;
            const bFunding = b.linked_transaction?.amount || b.bounty || 0;
            if (aFunding !== bFunding) return bFunding - aFunding;

            // Finally by creation date (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });

          setIssues(sortedIssues);
        } else {
          setError('Unexpected data format from server');
          setIssues([]);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch issues');
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const handleCardClick = (issue: IssueItem) => {
    navigate(`/issues/${issue.id}/number/${issue.number}`, { state: { issue } });
  };

  if (loading) return <p className="text-center text-white p-10">Loading issues...</p>;
  if (error) return <p className="text-center text-red-500 p-10">Error: {error}</p>;

  const filteredIssues = issues.filter(issue => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = selectedDifficulty === 'all' || issue.difficulty === selectedDifficulty;
    const matchesLanguage = selectedLanguage === 'all' || issue.language === selectedLanguage;
    const matchesStatus = selectedStatus === 'all' || issue.state === selectedStatus;
    return matchesSearch && matchesDifficulty && matchesLanguage && matchesStatus;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-black';
      case 'Hard': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500 text-white';
      case 'assigned': return 'bg-purple-500 text-white';
      case 'closed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const totalFunding = filteredIssues.reduce(
    (sum, issue) => sum + (issue.linked_transaction?.amount || issue.bounty || 0), 
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Available Issues</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Browse open-source issues and start earning $DEV tokens
            </p>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issues, tags, or technologies..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="React">React</SelectItem>
                  <SelectItem value="Node.js">Node.js</SelectItem>
                  <SelectItem value="Python">Python</SelectItem>
                  <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                  <SelectItem value="CSS">CSS</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{filteredIssues.length}</div>
                  <div className="text-sm text-muted-foreground">Available Issues</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">
                    1{totalFunding.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total $DEV Available</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-500">
                    {filteredIssues.reduce((sum, issue) => sum + issue.applicants, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Applicants</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-500">
                    {filteredIssues.reduce((sum, issue) => sum + parseInt(issue.timeEstimate) || 0, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Estimated Hours</div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredIssues.map(issue => (
              <Card
                key={issue.id}
                className="bg-surface hover:bg-muted transition-colors cursor-pointer"
                onClick={() => handleCardClick(issue)}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{issue.title}</span>
                    <Badge className={cn('text-xs', getStatusColor(issue.state))}>
                      {issue.state}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {issue.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                    <Badge className={cn('text-sm', getDifficultyColor(issue.difficulty))}>
                      {issue.difficulty}
                    </Badge>
                    <Badge className="text-sm">{issue.language}</Badge>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Coins className="h-4 w-4 mr-1 text-yellow-500" />
                      <span>
                        {issue.linked_transaction?.amount || issue.bounty || 0} $DEV
                        {issue.linked_transaction && (
                          <span className="text-xs ml-1">(tx)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {issue.timeEstimate}
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {issue.applicants}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(issue.url, '_blank');
                    }}
                    className="w-full mt-2"
                  >
                    View on GitHub <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Issues;