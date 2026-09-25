const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'manager', 'lead', 'developer', 'designer', 'member'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const contributorMappingSchema = new mongoose.Schema(
  {
    githubUser: {
      type: String,
      required: true,
      trim: true,
    },
    fairforgeUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [memberSchema],
    status: {
      type: String,
      enum: ['active', 'planning', 'in-progress', 'completed', 'archived'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
    },
    techStack: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    githubRepo: {
      owner: { type: String, default: '' },
      repo: { type: String, default: '' },
      branch: { type: String, default: 'main' },
      isConnected: { type: Boolean, default: false },
      lastSyncedAt: { type: Date },
      contributorMapping: [contributorMappingSchema],
    },
    analyticsConfig: {
      taskWeight: { type: Number, default: 35 },
      difficultyWeight: { type: Number, default: 20 },
      githubWeight: { type: Number, default: 25 },
      reviewWeight: { type: Number, default: 10 },
      collaborationWeight: { type: Number, default: 10 },
    },
  },
  {
    timestamps: true,
  }
);

// Index for user membership queries
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Project', projectSchema);
