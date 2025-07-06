// authController.js
import axios from "axios";
import jwt from "jsonwebtoken";

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const getGithubAuthUrl = (role) => {
  const allowedRoles = ["contributor", "organization"];
  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid role specified for GitHub OAuth.");
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: `${FRONTEND_URL}/api/auth/github/callback`,
    scope: "read:user repo",
    state: role, // used to pass role instead of query param in redirect_uri
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

// Start GitHub login (redirects to GitHub OAuth)
export const loginContributor = (req, res) => {
  res.redirect(getGithubAuthUrl("contributor"));
};

export const loginOrganization = (req, res) => {
  res.redirect(getGithubAuthUrl("organization"));
};

// GitHub OAuth callback handler
export const githubCallback = async (req, res) => {
  const code = req.query.code;
  const role = req.query.state; // safely extracted from OAuth `state`

  try {
    // Exchange code for GitHub access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) throw new Error("No access token received");

    // Fetch user details
    const userRes = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    const user = userRes.data;

    // Sign a JWT to return to frontend
    const token = jwt.sign(
      {
        id: user.id,
        username: user.login,
        avatar: user.avatar_url,
        role,
        github_token: accessToken, // optional: don't expose this to frontend unless needed
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Redirect to frontend with JWT
    res.redirect(`${FRONTEND_URL}/auth-success?token=${token}&role=${role}`);
  } catch (err) {
    console.error("GitHub OAuth failed:", err.response?.data || err.message);
    res.status(500).json({ error: "GitHub authentication failed" });
  }
};
