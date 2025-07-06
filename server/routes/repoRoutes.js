import express from "express";
import { fetchIssuesForRepos, listedRepos, saveSelectedRepo } from "../controllers/repoController.js";

const router = express.Router();

router.post("/save", saveSelectedRepo);
router.get("/listed",listedRepos);
router.get("/issues", fetchIssuesForRepos);

export default router;
