const mongoose = require('mongoose');

const gitHubActivitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['commit', 'pull_request', 'review', 'issue'],
      required: true,
      index: true,
    },
    githubAuthor: {
      type: String,
      required: true,
    },
    fairforgeUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
    shaOrId: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

gitHubActivitySchema.index({ project: 1, shaOrId: 1 }, { unique: true });
gitHubActivitySchema.index({ project: 1, fairforgeUser: 1 });

module.exports = mongoose.model('GitHubActivity', gitHubActivitySchema);
