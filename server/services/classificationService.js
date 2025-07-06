import { IssueClassifier } from 'issue-classifier';
import 'dotenv/config';

const classifier = new IssueClassifier({
  mosaiaApiKey: process.env.MOSAIA_API_KEY,
  mosaiaAgentId: process.env.MOSAIA_AGENT_ID,
  openRouterApiKey: process.env.OPENAI_API_KEY
});

export const classifyIssue = async (issue, repo) => {
  try {
    const result = await classifier.classifyIssue(
      issue.title,
      issue.body || '',
      repo.language || 'Unknown',
      issue.labels.map(label => label.name)
    );
    
    return {
      difficulty: result?.difficulty || 'medium',
      confidence: 0,       // Not provided by classifier, defaulting to 0
      estimatedHours: 0    // Not provided by classifier, defaulting to 0
    };
  } catch (error) {
    console.error('Classification failed:', error);
    return {
      difficulty: 'medium',
      confidence: 0,
      estimatedHours: 0
    };
  }
};
