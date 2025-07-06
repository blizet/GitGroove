import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";  // Make sure mongoose is imported here
import { connectToDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import repoRoutes from "./routes/repoRoutes.js";
import issueRoutes from './routes/issueRoutes.js';
import Issue from './models/issue.js';
import { startTxMonitor } from './services/TxMonitor.js'; // <-- import here

const app = express();
app.use(express.json());
app.use(cors());

// Create indexes
Issue.collection.createIndex({ githubId: 1 }, { unique: true });
Issue.collection.createIndex({ repoId: 1 });
Issue.collection.createIndex({ difficulty: 1 });

// Routes
app.use('/api/issues', issueRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/repo", repoRoutes);

try {
  connectToDB();
} catch (error) {
  console.log('there is error in connection', error);
}

// Start the transaction monitor once DB connection is open
mongoose.connection.once('open', () => {
  console.log('MongoDB connection established.');
  startTxMonitor().catch(console.error);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

app.get("/", (req, res) => {
  res.send("Welcome to GitGroove");
});
