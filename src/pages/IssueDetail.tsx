// src/pages/IssueDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  GitBranch, 
  Clock, 
  Star, 
  Eye, 
  Circle,
  CheckCircle2,
  Link as LinkIcon,
  Github,
  MessageSquare,
  User,
  Bookmark,
  GitPullRequest,
  Users
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

// Import RainbowKit's useAccount to get connected wallet address
import { useAccount } from 'wagmi';

interface IssueDetail {
  id: number;
  number: number;
  title: string;
  description: string;
  difficulty: string;
  language: string;
  project: string;
  repo_url: string;
  bounty: number;
  time_estimate: string;
  applicants: number;
  tags: string[];
  created_at: string;
  html_url: string;
  state: 'open' | 'closed';
  linked_transaction?: string;
  assignee: string | null;
  comments: number;
  applicants_list?: Array<{
    id: number;
    username: string;
    comment: string;
  }>;
}

const IssueDetail = () => {
  const { id, number } = useParams<{ id:string, number: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [issue, setIssue] = useState<IssueDetail | null>(location.state?.issue || null);
  const [loading, setLoading] = useState(!location.state?.issue);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRewarding, setIsRewarding] = useState(false);
  const [rewardCollected, setRewardCollected] = useState(false);

  const { toast } = useToast();
  const role = localStorage.getItem('role');

  // RainbowKit hook to get wallet address
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (!location.state?.issue) {
      const fetchIssue = async () => {
        setLoading(true);
        setError(null);

        try {
          const token = localStorage.getItem('github_token');
          if (!token) {
            throw new Error('No authentication token found');
          }

          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/issues/${id}`, {
            params: { token }
          });

          setIssue(response.data);
        } catch (err: any) {
          setError(err.response?.data?.error || err.message || 'Failed to fetch issue details');
        } finally {
          setLoading(false);
        }
      };

      fetchIssue();
    }
  }, [id, location.state]);

  const handleApply = async () => {
    if (!comment.trim()) {
      setError('Please add a comment explaining your approach');
      return;
    }

    setIsApplying(true);
    setError(null);

    try {
      const token = localStorage.getItem('github_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/issues/${id}/comments/${number}`,
        { comment },
        { params: { token } }
      );

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/issues/${id}/apply`,
        {},
        { params: { token } }
      );

      setApplicationSuccess(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/issues/${id}`, {
        params: { token }
      });
      setIssue(response.data);
      toast({
        title: "Application submitted!",
        description: "Your interest in this issue has been recorded.",
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to apply for issue');
      toast({
        title: "Application failed",
        description: err.response?.data?.error || err.message || 'Failed to apply for issue',
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedApplicant) {
      toast({
        title: "No applicant selected",
        description: "Please select an applicant to assign this issue to",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    try {
      const token = localStorage.getItem('github_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/issues/${id}/assign`,
        { assignee: selectedApplicant },
        { params: { token } }
      );

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/issues/${id}`, {
        params: { token }
      });
      setIssue(response.data);
      toast({
        title: "Issue assigned!",
        description: `You've assigned this issue to ${selectedApplicant}`,
      });
    } catch (err: any) {
      toast({
        title: "Assignment failed",
        description: err.response?.data?.error || err.message || 'Failed to assign issue',
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // New: handle reward collecting
  const handleCollectReward = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to collect the reward.",
        variant: "destructive",
      });
      return;
    }

    setIsRewarding(true);
    try {
      // Call your backend API to claim reward with wallet address
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/issues/${id}/claim-reward`,
        { walletAddress: address }
      );

      if(response.data.success) {
        setRewardCollected(true);
        toast({
          title: "Reward Collected!",
          description: "You have successfully claimed your DEV tokens.",
        });
      } else {
        throw new Error(response.data.message || "Failed to claim reward");
      }
    } catch (err: any) {
      toast({
        title: "Failed to collect reward",
        description: err.response?.data?.error || err.message || "Could not claim reward",
        variant: "destructive",
      });
    } finally {
      setIsRewarding(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    if (!issue) return null;
    return issue.state === 'open' ? (
      <Circle className="h-4 w-4 text-green-500" />
    ) : (
      <CheckCircle2 className="h-4 w-4 text-purple-500" />
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 text-center">
        Loading issue details...
      </div>
      <Footer />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 text-center text-red-500">
        Error: {error}
      </div>
      <Footer />
    </div>
  );

  if (!issue) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 text-center">
        Issue not found
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Issues
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-surface">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon()}
                  <span className="text-sm font-medium">
                    {issue.state === 'open' ? 'Open' : 'Closed'} • Issue #{issue.number}
                  </span>
                </div>
                <CardTitle className="text-2xl">{issue.title}</CardTitle>
                <CardDescription className="text-lg">
                  {issue.project}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: issue.description }} />
              </CardContent>
            </Card>

            {/* Show Application or Reward button */}
            {role === 'contributor' && (
              <Card className="bg-surface">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {issue.state === 'open' ? 'Apply for this Issue' : 'Collect Your Reward'}
                  </CardTitle>
                  <CardDescription>
                    {issue.state === 'open' ? (
                      applicationSuccess ? (
                        <span className="text-green-500">Your application was submitted successfully!</span>
                      ) : (
                        'Explain why you\'re the right person to solve this issue'
                      )
                    ) : (
                      rewardCollected
                        ? <span className="text-green-500">Reward collected successfully!</span>
                        : 'Claim your DEV token reward for completing this issue.'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {issue.state === 'open' && !applicationSuccess && (
                    <>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Describe your approach to solving this issue..."
                        className="min-h-[120px]"
                      />
                      {error && <p className="text-red-500 text-sm">{error}</p>}
                      <Button
                        onClick={handleApply}
                        disabled={isApplying}
                        className="w-full"
                      >
                        {isApplying ? 'Applying...' : 'Request Assignment'}
                        <Bookmark className="ml-2 h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {issue.state === 'closed' && (
                    <Button
                      onClick={handleCollectReward}
                      disabled={isRewarding || rewardCollected}
                      className="w-full"
                    >
                      {isRewarding
                        ? 'Collecting Reward...'
                        : rewardCollected
                          ? 'Reward Collected'
                          : 'Collect Reward'}
                      <Star className="ml-2 h-4 w-4 text-yellow-500" />
                    </Button>
                  )}

                  {applicationSuccess && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(issue.html_url, '_blank')}
                      className="w-full"
                    >
                      View Your Comment on GitHub
                      <MessageSquare className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {role === 'organization' && issue.state === 'open' && issue.applicants_list && issue.applicants_list.length > 0 && (
              <Card className="bg-surface">
                <CardHeader>
                  <CardTitle>Applicants</CardTitle>
                  <CardDescription>
                    Select a contributor to assign this issue to:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    onValueChange={(value) => setSelectedApplicant(value)}
                    value={selectedApplicant}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an applicant" />
                    </SelectTrigger>
                    <SelectContent>
                      {issue.applicants_list.map((applicant) => (
                        <SelectItem key={applicant.id} value={applicant.username}>
                          {applicant.username}: {applicant.comment}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAssign}
                    disabled={isAssigning || !selectedApplicant}
                    className="mt-4 w-full"
                  >
                    {isAssigning ? 'Assigning...' : 'Assign Issue'}
                    <User className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-surface">
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  <span>{issue.language}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Estimate: {issue.time_estimate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>Bounty: {issue.bounty} DEV tokens</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{issue.applicants} applicants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Assignee: {issue.assignee || 'None'}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {issue.tags.map((tag) => (
                    <Badge key={tag} className="uppercase">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Repo URL */}
                <div className="pt-4 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  <a href={issue.repo_url} target="_blank" rel="noopener noreferrer" className="underline">
                    Repository Link
                  </a>
                </div>

                {/* View on GitHub & View Pull Requests buttons */}
                <div className="pt-4 space-y-2">
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => window.open(issue.html_url, '_blank')}
                  >
                    View on GitHub
                    <Github className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`${issue.html_url}/pulls`, '_blank')}
                  >
                    View Pull Requests
                    <GitPullRequest className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default IssueDetail;
