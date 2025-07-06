import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  githubId: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'difficult'], required: true },
  language: String,
  labels: [String],
  repo_name: String,
  repo_url: String,
  html_url: String,
  created_at: Date,
  state: { type: String, enum: ['open', 'closed', 'assigned'], default: 'open' },
  assignee: String,
  comments: Number,
  classificationDate: { type: Date, default: Date.now },
  repoId: { type: Number, required: true },
  bounty: Number,
  time_estimate: String,
  applicants: { type: Number, default: 0 },
  applicants_list: [
    {
      id: Number,
      username: String,
      comment: String,
      createdAt: Date
    }
  ],

  // 🔹 New fields for transactions and funding
  linkedTransactions: [
    {
      txHash: String,
      amount: Number,
      timestamp: Date
    }
  ],
  totalFunding: { type: Number, default: 0 }
});

// 🔹 Automatically calculate total funding before saving
issueSchema.pre('save', function (next) {
  this.totalFunding = this.linkedTransactions.reduce(
    (sum, tx) => sum + (tx.amount || 0), 0
  );
  next();
});

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;
