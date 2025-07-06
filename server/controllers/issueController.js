import Issue from '../models/issue.js';
import Repo from '../models/repo.js';
import { classifyIssue } from '../services/classificationService.js';
import { Octokit } from '@octokit/rest';

// Initialize Octokit instance without token by default; token is passed per request
const octokit = new Octokit();

// Verify token permissions and debug
async function verifyTokenPermissions(token) {
  try {
    const { headers } = await octokit.request('GET /', {
      headers: { authorization: `token ${token}` }
    });
    return headers['x-oauth-scopes']?.split(', ').map(s => s.trim()) || [];
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return [];
  }
}

// Fetch open issues from a repo
async function fetchGitHubIssues(repo, githubToken) {
  try {
    const [owner, repoName] = repo.fullName.split('/');
    const response = await octokit.issues.listForRepo({
      owner,
      repo: repoName,
      state: 'all', // ✅ Fetch only closed issues
      headers: { authorization: `token ${githubToken}` }
    });

    // ❌ Exclude pull requests (which appear with a `pull_request` field)
    const issuesOnly = response.data.filter(issue => !issue.pull_request);

    return issuesOnly;
  } catch (error) {
    console.error(`GitHub API error for ${repo.fullName}:`, error.message);
    return [];
  }
}



// Controller: Get all issues with classification
export const getIssuesWithClassification = async (req, res) => {
  try {
    const githubToken = req.query.token;
    if (!githubToken) return res.status(401).json({ error: 'GitHub token required' });

    const repos = await Repo.find({}).lean();
    const allIssues = (
      await Promise.all(
        repos.map(async (repo) => {
          const issues = await fetchGitHubIssues(repo, githubToken);
          return issues.map(issue => ({ ...issue, repo }));
        })
      )
    ).flat();

    const classified = await Promise.all(
      allIssues.map(async (issue) => {
        let cls = await Issue.findOne({ githubId: issue.id });
        if (!cls) {
          const result = await classifyIssue(issue, issue.repo);
          cls = new Issue({
            githubId: issue.id,
            number: issue.number,
            title: issue.title,
            description: issue.body,
            difficulty: result.difficulty,
            language: issue.repo.language,
            labels: issue.labels?.map(l => l.name) || [],
            repo_name: issue.repo.name,
            repo_url: issue.repo.html_url,
            html_url: issue.html_url,
            created_at: issue.created_at,
            state: issue.state,
            classificationDate: new Date(),
            repoId: issue.repo.githubId,
            assignee: issue.assignee?.login || null,
            applicants: 0,
            applicants_list: []
          });
          await cls.save();
        }

        return {
          id: issue.id,
          number: issue.number,
          title: issue.title,
          body: issue.body,
          difficulty: cls.difficulty,
          language: issue.repo.language,
          repo_name: issue.repo.name,
          repo_url: issue.repo.html_url,
          html_url: issue.html_url,
          labels: issue.labels?.map(l => l.name) || [],
          created_at: issue.created_at,
          state: issue.state,
          assignee: issue.assignee?.login || null,
          assignees: issue.assignees?.map(a => a.login) || [],
          comments: issue.comments,
          bounty: cls.bounty || 0,
          time_estimate: cls.time_estimate || 'N/A',
          applicants: cls.applicants || 0,
          applicants_list: cls.applicants_list || []
        };
      })
    );

    res.json(classified);
  } catch (e) {
    console.error('Error getting classified issues:', e);
    res.status(500).json({ error: 'Failed to get issues' });
  }
};

// Controller: Get detailed info for a single issue
export const getIssueDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const githubToken = req.query.token;
    if (!githubToken) return res.status(401).json({ error: 'GitHub token required' });

    let issue = await Issue.findOne({ githubId: Number(id) }).lean();
    if (!issue) {
      // If not found locally, fetch from GitHub and classify
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (!issue.applicants_list?.length) {
      const repo = await Repo.findOne({ githubId: issue.repoId });
      if (repo) {
        const [owner, repoName] = repo.fullName.split('/');
        const { data: comments } = await octokit.issues.listComments({
          owner,
          repo: repoName,
          issue_number: issue.number,
          headers: { authorization: `token ${githubToken}` }
        });

        const applicants = comments
          .filter(c => c.body.includes('### 🚀 Application for Issue'))
          .map(c => ({
            id: c.id,
            username: c.user.login,
            comment: c.body,
            createdAt: c.created_at
          }));

        issue.applicants_list = applicants;
        issue.applicants = applicants.length;
      }
    }

    const linkedTransaction = await getLinkedTransaction(issue.githubId);

    res.json({
      ...issue,
      linked_transaction: linkedTransaction?.txHash,
      bounty: issue.bounty || 0,
      time_estimate: issue.time_estimate || 'N/A'
    });
  } catch (e) {
    console.error('Error getting issue details:', e);
    res.status(500).json({ error: 'Failed to get issue details' });
  }
};

// Controller: Post comment (application) on an issue
export const postIssueComment = async (req, res) => {
  try {
    const { id,number } = req.params; 
    const githubIssueNumber = number;
    const { comment } = req.body;
    const githubToken = req.query.token;

    if (!githubToken) return res.status(401).json({ error: 'GitHub token required' });
    if (!id ) return res.status(400).json({ error: 'Issue ID and number are required' });

    const tokenScopes = await verifyTokenPermissions(githubToken);
    const canComment = tokenScopes.includes('public_repo') || tokenScopes.includes('repo');

    if (!canComment) {
      return res.status(403).json({
        error: 'Insufficient GitHub token permissions',
        required: 'public_repo or repo',
        current_scopes: tokenScopes,
        solution: 'Create a token at https://github.com/settings/tokens/new'
      });
    }

    const issue = await Issue.findOne({ githubId: Number(id) });
    if (!issue) return res.status(404).json({ error: 'Issue not found in DB' });

    const repo = await Repo.findOne({ githubId: issue.repoId });
    if (!repo) return res.status(404).json({ error: 'Repository not found in DB' });

    const [owner, repoName] = repo.fullName.split('/');

    // Use issue.number (from DB), not param, to ensure consistency
    

    const body = `
### 🚀 Application for Issue #${githubIssueNumber}

**Approach:**  
${comment}
`.trim();

    const { data } = await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
      owner,
      repo: repoName,
      issue_number: githubIssueNumber,
      body,
      headers: { authorization: `token ${githubToken}` }
    });

    const applicantData = {
      id: data.id,
      username: data.user.login,
      comment,
      createdAt: new Date(),
      walletAddress: walletAddress || null
    };

    await Issue.updateOne(
      { githubId: Number(id) },
      { $inc: { applicants: 1 }, $push: { applicants_list: applicantData } }
    );

    res.json({
      success: true,
      comment: data,
      applicants: (issue.applicants || 0) + 1,
      applicant: applicantData
    });
  } catch (err) {
    console.error('Error posting comment:', err);
    const msg = err.response?.data?.message || err.message;
    res.status(err.status || 500).json({
      error: 'Failed to post comment',
      details: msg,
      documentation: 'https://docs.github.com/rest/issues/comments#create-an-issue-comment'
    });
  }
};



// Controller: Get list of applicants for an issue
export const getIssueApplicants = async (req, res) => {
  try {
    const { id } = req.params;
    const githubToken = req.query.token;
    if (!githubToken) return res.status(401).json({ error: 'GitHub token required' });

    const issue = await Issue.findOne({ githubId: Number(id) });
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const repo = await Repo.findOne({ githubId: issue.repoId });
    if (!repo) return res.status(404).json({ error: 'Repository not found' });

    const [owner, repoName] = repo.fullName.split('/');
    const { data: comments } = await octokit.issues.listComments({
      owner,
      repo: repoName,
      issue_number: issue.number,
      headers: { authorization: `token ${githubToken}` }
    });

    const applicants = comments
      .filter(c => c.body.includes('### 🚀 Application for Issue'))
      .map(c => ({
        id: c.id,
        username: c.user.login,
        comment: c.body,
        createdAt: c.created_at,
        walletAddress: c.body.match(/Wallet Address:\s*(.*)/)?.[1] || null
      }));

    // Update DB applicants info
    await Issue.updateOne(
      { githubId: Number(id) },
      { applicants: applicants.length, applicants_list: applicants }
    );

    res.json({ applicants });
  } catch (e) {
    console.error('Error getting applicants:', e);
    res.status(500).json({ error: 'Failed to get applicants' });
  }
};

// Controller: Assign issue to a user
export const assignIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignee } = req.body;
    const githubToken = req.query.token;
    if (!githubToken) return res.status(401).json({ error: 'GitHub token required' });

    const issue = await Issue.findOne({ githubId: Number(id) });
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const repo = await Repo.findOne({ githubId: issue.repoId });
    if (!repo) return res.status(404).json({ error: 'Repository not found' });

    const [owner, repoName] = repo.fullName.split('/');
    const { data } = await octokit.issues.update({
      owner,
      repo: repoName,
      issue_number: issue.number,
      assignees: [assignee],
      headers: { authorization: `token ${githubToken}` }
    });

    await Issue.updateOne(
      { githubId: Number(id) },
      { assignee: data.assignee?.login || assignee, state: 'assigned' }
    );

    res.json({ success: true, assignee: data.assignee?.login || assignee, state: data.state });
  } catch (e) {
    console.error('Error assigning issue:', e);
    res.status(500).json({ error: 'Failed to assign issue' });
  }
};

// Controller: Increment applicant count (simple apply)
export const applyForIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const githubToken = req.query.token;
    if (!githubToken) return res.status(401).json({ error: 'GitHub token required' });

    const result = await Issue.updateOne({ githubId: Number(id) }, { $inc: { applicants: 1 } });
    if (result.modifiedCount === 0) return res.status(404).json({ error: 'Issue not found' });

    res.json({ success: true });
  } catch (e) {
    console.error('Error applying for issue:', e);
    res.status(500).json({ error: 'Failed to apply for issue' });
  }
};

// Mock blockchain linking
async function getLinkedTransaction(issueId) {
  return { txHash: '0x123...abc', amount: '1.5', currency: 'DEV' };
}

// Add this new controller without schema changes
export const getFundedIssues = async (req, res) => {
  try {
    const issues = await Issue.aggregate([
      {
        $addFields: {
          // Calculate total funding from linked_transaction (if exists)
          calculatedFunding: {
            $cond: [
              { $gt: [{ $ifNull: ["$linked_transaction.amount", 0] }, 0] },
              "$linked_transaction.amount",
              0
            ]
          },
          // Priority: open (1) > assigned (2) > closed (3)
          statusPriority: {
            $switch: {
              branches: [
                { case: { $eq: ["$state", "open"] }, then: 1 },
                { case: { $eq: ["$state", "assigned"] }, then: 2 },
                { case: { $eq: ["$state", "closed"] }, then: 3 }
              ],
              default: 4
            }
          }
        }
      },
      {
        $sort: {
          statusPriority: 1, // Open first
          calculatedFunding: -1, // Highest funded first
          created_at: -1 // Newest first
        }
      }
    ]);

    res.json(issues);
  } catch (e) {
    console.error('Error fetching funded issues:', e);
    res.status(500).json({ error: 'Failed to get funded issues' });
  }
};

// New controller for unfunded open issues
export const getUnfundedOpenIssues = async (req, res) => {
  try {
    const issues = await Issue.find({
      state: 'open',
      assignee: { $exists: false },
      $or: [
        { fundingTx: { $exists: false } },
        { fundingTx: null }
      ]
    })
    .sort({ created_at: 1 }) // Oldest first
    .lean();

    // Format response
    const formattedIssues = issues.map(issue => ({
      id: issue.githubId,
      number: issue.number,
      title: issue.title,
      description: issue.description,
      created_at: issue.created_at,
      repo_name: issue.repo_name,
      repo_url: issue.repo_url,
      html_url: issue.html_url,
      language: issue.language,
      difficulty: issue.difficulty,
      applicants: issue.applicants,
      funding_status: 'unfunded'
    }));

    res.json(formattedIssues);
  } catch (error) {
    console.error('Error fetching unfunded issues:', error);
    res.status(500).json({ error: 'Failed to get unfunded issues' });
  }
};
