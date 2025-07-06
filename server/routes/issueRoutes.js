import express from 'express';
import {
  getIssuesWithClassification,
  getIssueDetails,
  postIssueComment,
  applyForIssue,
  getIssueApplicants,
  assignIssue,
  getFundedIssues,
  getUnfundedOpenIssues  // Add this new controller
} from '../controllers/issueController.js';

const router = express.Router();

// ======================
// Issue Discovery Routes
// ======================
router.get('/classified', getIssuesWithClassification);
router.get('/funded', getFundedIssues); // Sorted: Open funded → Open unfunded → Closed
router.get('/unfunded', getUnfundedOpenIssues); // New route for unfunded open issues

// ======================
// Single Issue Routes
// ======================
router.get('/:id', getIssueDetails);
router.get('/:id/applicants', getIssueApplicants);

// ======================
// Contribution Workflow
// ======================
router.post('/:id/comments/:number', postIssueComment);
router.post('/:id/apply', applyForIssue);
router.post('/:id/assign', assignIssue);

export default router;