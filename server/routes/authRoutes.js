// routes/authRoutes.js

import express from "express";
import {
  loginContributor,
  loginOrganization,
  githubCallback,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/github/contributor", loginContributor);
router.get("/github/organization", loginOrganization);
router.get("/github/callback", githubCallback);

export default router; 
