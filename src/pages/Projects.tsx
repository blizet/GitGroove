import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Repo } from "@/context/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Star, GitBranch, Clock } from "lucide-react";

const Projects = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      navigate("/auth");
      return;
    }

    try {
      jwtDecode(token);
      setIsAuthorized(true);
      fetchRepos(token);
    } catch {
      navigate("/auth");
    }
  }, []);

  const fetchRepos = async (token: string) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

      const response = await axios.get(`${backendUrl}/api/repo/listed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRepos(response.data);
    } catch (err) {
      console.error("Failed to fetch repos from backend:", err);
      setError("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    repo.ownerLogin.toLowerCase().includes(searchTerm.toLowerCase())
  );



  if (!isAuthorized) {
    return <p className="text-center text-white p-10">Checking authorization...</p>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading projects...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Projects</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Browse available open-source projects and their issues
            </p>
            
            {/* Search */}
            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{filteredRepos.length}</div>
                  <div className="text-sm text-muted-foreground">Active Projects</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {filteredRepos.reduce((sum, repo) => sum + repo.stargazersCount, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Stars</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {new Set(filteredRepos.map(repo => repo.ownerLogin)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Unique Owners</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            {filteredRepos.map((repo) => (
              <Card 
                key={repo._id} 
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/issues/${repo._id}`)}
              >
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{repo.name}</CardTitle>
                      <CardDescription className="text-base mb-3">
                        {repo.description || "No description available"}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {repo.stargazersCount} stars
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          {repo.ownerLogin}
                        </Badge>
                        
                      </div>
                    </div>
                    <div>
                      <Button variant="outline">
                        View Issues
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {filteredRepos.length === 0 && repos.length > 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No projects match your search</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms
                </p>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          )}

          {repos.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-4">
                  There are currently no projects available
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Projects;