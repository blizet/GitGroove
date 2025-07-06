export interface DecodedToken {
  id: string;
  username: string;
  avatar: string;
  role: "contributor" | "organization";
  github_token: string;
  exp: number;
  iat: number;
}

export interface Repo {
  createdAt: number;
  _id: string;
  githubId: number;
  name: string;
  fullName: string;
  description?: string;
  stargazersCount: number;
  ownerLogin: string;
  url: string;
  addedByUserId: string;
}

export interface GitHubIssue {
  id: number;
  title: string;
  body: string;
  html_url: string;
  created_at: string;
  labels: { name: string }[];
  // You can expand fields as needed
}

export interface IssueItem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  language: string;
  project: string;
  bounty: number;
  timeEstimate: string;
  applicants: number;
  tags: string[];
  organization?: string;
  createdAt: string;
  url: string;
}
