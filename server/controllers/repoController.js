import Repo from "../models/repo.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const saveSelectedRepo = async (req, res) => {
  const { token, repo } = req.body;

  if (!token || !repo) {
    return res.status(400).json({ error: "Token and repo data are required." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const newRepo = {
      githubId: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      stargazersCount: repo.stargazers_count,
      ownerLogin: repo.owner.login,
      url: repo.html_url,
      addedByUserId: decoded.id,
    };

    const savedRepo = await Repo.findOneAndUpdate(
      { githubId: repo.id },
      newRepo,
      { upsert: true, new: true }
    );

    res.status(200).json(savedRepo);
  } catch (err) {
    console.error("Repo save error:", err.message);
    res.status(401).json({ error: "Invalid token or data." });
  }
};

// Fetch repos saved by the authenticated user
export const listedRepos = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Authorization header missing" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token missing" });

  try {
    // Verify token is valid (no user filtering)
    jwt.verify(token, JWT_SECRET);

    // Fetch all repos from MongoDB (no user filter)
    const repos = await Repo.find({}).lean();

    res.status(200).json(repos);
  } catch (err) {
    console.error("Error fetching repos:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

export const fetchIssuesForRepos = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Authorization header missing" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token missing" });

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const githubToken = decoded.github_token;
  if (!githubToken) {
    return res.status(400).json({ error: "Missing GitHub token in JWT" });
  }

  try {
    const repos = await Repo.find({}).lean();

    const issuesByRepo = await Promise.all(
      repos.map(async (repo) => {
        const resIssues = await axios.get(
          `https://api.github.com/repos/${repo.fullName}/issues?state=open`,
          {
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: "application/vnd.github+json",
            },
          }
        );
        return {
          repoId: repo.githubId,
          repoName: repo.fullName,
          issues: resIssues.data,
        };
      })
    );

    res.status(200).json(issuesByRepo);
  } catch (err) {
    console.error("Error fetching issues:", err);
    res.status(500).json({ error: "Failed to fetch GitHub issues." });
  }
};
