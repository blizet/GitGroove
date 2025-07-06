import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DecodedToken } from "@/context/types";
import { useTheme } from "next-themes";
import { useAccount } from "wagmi"; // <-- RainbowKit wallet integration

const Dashboard = () => {
  const { theme } = useTheme();
  const { address, isConnected } = useAccount();
  const [role, setRole] = useState("");
  const [repos, setRepos] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"repos" | "issues">("repos");

  const isTokenExpired = (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp && Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  };

  const fetchOpenIssues = async (repoName: string, githubToken: string) => {
    const repo = repos.find(r => r.name === repoName);
    if (!repo) return;
    setIssuesLoading(true);
    try {
      const res = await axios.get(
        `https://api.github.com/repos/${repo.full_name}/issues?state=open`,
        { headers: { Authorization: `Bearer ${githubToken}` } }
      );
      setIssues(res.data);
      setActiveTab("issues");
    } catch (err) {
      console.error("Failed to fetch issues:", err);
    } finally {
      setIssuesLoading(false);
    }
  };

  const handleRepoSelect = async (value: string) => {
    setSelectedRepo(value);
    localStorage.setItem("selected_repo", value);
    const githubToken = localStorage.getItem("github_token")!;
    await fetchOpenIssues(value, githubToken);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/repo/save`, {
        token: localStorage.getItem("auth_token"),
        repo: repos.find(r => r.name === value),
      });
    } catch (err) {
      console.error("Failed to save repo:", err);
    }
  };

  const handleClearSelection = () => {
    setSelectedRepo("");
    setIssues([]);
    localStorage.removeItem("selected_repo");
    setActiveTab("repos");
  };

  const fetchRepos = async (githubToken: string) => {
    try {
      const res = await axios.get("https://api.github.com/user/repos", {
        headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github+json" },
      });
      setRepos(res.data);
    } catch (err) {
      console.error("Failed to fetch repos:", err);
      setError("Failed to load repositories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tokenParam = new URLSearchParams(window.location.search).get("token");
    const token = tokenParam || localStorage.getItem("auth_token")!;
    if (!token || isTokenExpired(token)) {
      localStorage.clear();
      setError("Session expired or missing. Please log in again.");
      setLoading(false);
      return;
    }
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      setRole(decoded.role);
      localStorage.setItem("auth_token", token);
      localStorage.setItem("github_token", decoded.github_token);
      localStorage.setItem("role", decoded.role);
      fetchRepos(decoded.github_token);
    } catch {
      setError("Authentication failed.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("selected_repo");
    const githubToken = localStorage.getItem("github_token");
    if (repos.length > 0 && saved && githubToken) {
      setSelectedRepo(saved);
      fetchOpenIssues(saved, githubToken);
    }
  }, [repos]);

  const getThemeBg = theme === "dark"
    ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
    : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900";
  const getCardBg = theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="relative flex-1">
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
          </div>
        ) : error ? (
          <div className={`border-l-4 border-red-500 p-4 max-w-3xl mx-auto mt-12 ${getCardBg}`}>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : role === "organization" ? (
          <div className={`min-h-screen ${getThemeBg} px-6 py-32`}>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
              <div className={`${getCardBg} w-full md:w-1/4 rounded-xl p-6 sticky top-6`}>
                <h2 className="text-2xl font-bold mb-6">
                  {selectedRepo ? "Selected Repository" : "Select Repository"}
                </h2>
                {selectedRepo ? (
                  <div className="space-y-4">
                    <div className="bg-indigo-600 rounded-lg p-4 text-white">
                      <h3 className="font-semibold">{repos.find(r => r.name === selectedRepo)?.name}</h3>
                      <p className="text-sm text-indigo-100 truncate">
                        {repos.find(r => r.name === selectedRepo)?.description}
                      </p>
                      <p className="mt-2 text-xs">
                        Last updated: {new Date(repos.find(r => r.name === selectedRepo)?.updated_at!).toLocaleDateString()}
                      </p>
                      <button onClick={handleClearSelection} className="mt-3 underline">
                        Change Repository
                      </button>
                    </div>
                  </div>
                ) : (
                  repos.map(repo => (
                    <div
                      key={repo.id}
                      onClick={() => handleRepoSelect(repo.name)}
                      className={`p-4 rounded-lg cursor-pointer ${
                        theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <h3 className="font-semibold">{repo.name}</h3>
                      <p className="text-sm truncate">{repo.description}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="w-full md:w-3/4">
                {selectedRepo ? (
                  <div className={`${getCardBg} rounded-xl p-6`}>
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-3xl font-bold">{selectedRepo}</h1>
                      <div className="space-x-2">
                        <button onClick={() => setActiveTab("repos")} className={activeTab === "repos" ? "bg-indigo-600 text-white rounded-full px-2" : ""}>
                          Repository Info
                        </button>
                        <button onClick={() => setActiveTab("issues")} className={activeTab === "issues" ? "bg-indigo-600 text-white rounded-full px-2" : ""}>
                          Issues ({issues.length})
                        </button>
                      </div>
                    </div>
                    {activeTab === "repos" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6">
                          <p>Stars: {repos.find(r => r.name === selectedRepo)?.stargazers_count}</p>
                          <p>Forks: {repos.find(r => r.name === selectedRepo)?.forks_count}</p>
                        </div>
                        <div className="p-6">
                          <p>Description: {repos.find(r => r.name === selectedRepo)?.description}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {issuesLoading ? (
                          <p className="text-center">Loading issues...</p>
                        ) : issues.length === 0 ? (
                          <p className="text-center">No open issues</p>
                        ) : (
                          issues.map(issue => (
                            <div key={issue.id} className={`${getCardBg} p-6 rounded-lg`}>
                              <div className="flex items-start">
                                <img src={issue.user.avatar_url} className="h-10 w-10 rounded-full" />
                                <div className="ml-4 flex-1">
                                  <h3 className="font-medium">
                                    <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
                                      {issue.title}
                                    </a>{" "}
                                    <span className="text-xs">#{issue.number}</span>
                                  </h3>
                                  <p className="text-sm">{issue.body?.slice(0, 200)}...</p>
                                  <p className="text-xs mt-1">
                                    by {issue.user.login} on {new Date(issue.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`${getCardBg} p-12 text-center`}>
                    Select a repository from the sidebar to view details & issues
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={`${getThemeBg} flex items-center justify-center p-6`}>
            <div className="text-center">
              <h1 className="text-2xl font-semibold mb-2">Welcome, Contributor!</h1>
              {isConnected ? (
                <p className="text-sm">
                  Connected Wallet: <span className="font-mono">{address}</span>
                </p>
              ) : (
                <p className="text-sm text-red-500">No wallet connected.</p>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
