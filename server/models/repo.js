import { Schema, model } from "mongoose";

const repoSchema = new Schema(
  {
    githubId: { type: Number, required: true, unique: true }, // repo.id from GitHub API
    name: { type: String, required: true },                   // repo.name
    fullName: { type: String, required: true },               // repo.full_name
    description: { type: String, default: "" },
    stargazersCount: { type: Number, default: 0 },            // repo.stargazers_count
    ownerLogin: { type: String, required: true },             // repo.owner.login
    url: { type: String, required: true },                     // repo.html_url
    // You can add more fields from the GitHub repo object as needed
  },
  { timestamps: true }
);

const Repo = model("Repo", repoSchema);

export default Repo;
