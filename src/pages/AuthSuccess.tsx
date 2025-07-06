import React, { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DecodedToken } from "@/context/types";

const AuthSuccess = () => {
  const [role, setRole] = useState("");
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<string>("");

  const handleRepoSelect = async (value: string) => {
    setSelectedRepo(value);
    localStorage.setItem("selected_repo", value);

    const repo = repos.find((r) => r.name === value);
    const token = localStorage.getItem("auth_token");

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/repo/save`, {
        token,
        repo,
      });
      console.log("Repo saved to DB");
    } catch (err) {
      console.error("Failed to save repo:", err);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const { github_token, role } = decoded;

      setRole(role);
      localStorage.setItem("auth_token", token);
      localStorage.setItem("github_token", github_token);
      localStorage.setItem("role", role);

      const savedRepo = localStorage.getItem("selected_repo");
      if (savedRepo) setSelectedRepo(savedRepo);

      fetchRepos(github_token);
    } catch (err) {
      console.error("Invalid JWT token:", err);
      setError("Authentication failed.");
      setLoading(false);
    }
  }, []);

  const fetchRepos = async (githubToken: string) => {
    try {
      const res = await axios.get("https://api.github.com/user/repos", {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
        },
      });
      setRepos(res.data);
    } catch (err) {
      console.error("Failed to fetch repos:", err);
      setError("Failed to load GitHub repositories.");
    } finally {
      setLoading(false);
    }
  };

  const renderOrganizationLayout = () => (
    <div className="p-8 text-white text-center py-32">
      <h1 className="text-3xl font-bold mb-4">Welcome, Organization!</h1>
      <p className="text-lg mb-6">Select one of your repositories to manage issues:</p>

      <div className="mb-8">
        <select
          className="w-full md:w-1/2 p-2 rounded text-black"
          value={selectedRepo}
          onChange={(e) => handleRepoSelect(e.target.value)}
        >
          <option value="">-- Select a Repository --</option>
          {repos.map((repo: any) => (
            <option key={repo.id} value={repo.name}>
              {repo.full_name}
            </option>
          ))}
        </select>
      </div>

      {selectedRepo && (
        <div className="mt-6 border rounded p-4 max-w-xl mx-auto bg-white text-black text-left">
          <h2 className="text-xl font-bold mb-2">Selected Repository: {selectedRepo}</h2>
          <p>{repos.find((r: any) => r.name === selectedRepo)?.description || "No description"}</p>
          <p className="text-sm mt-2 text-gray-600">
            ⭐ Stars: {repos.find((r: any) => r.name === selectedRepo)?.stargazers_count}
          </p>
        </div>
      )}
    </div>
  );

  const renderContributorLayout = () => (
    <div className="p-16 m-32 text-white text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome, Contributor!</h1>
      <p className="text-lg">You're authenticated. Start contributing to open source projects!</p>
    </div>
  );

  return (
    <>
      <Navbar />
      {loading ? (
        <p className="text-white p-10 text-center">Loading...</p>
      ) : error ? (
        <p className="text-red-500 p-10 text-center">{error}</p>
      ) : role === "organization" ? (
        renderOrganizationLayout()
      ) : (
        renderContributorLayout()
      )}
      <Footer />
    </>
  );
};

export default AuthSuccess;
