const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actionType: {
      type: String,
      required: true,
      enum: [
        'task_created',
        'task_updated',
        'task_status_changed',
        'task_assigned',
        'task_completed',
        'comment_added',
        'member_added',
        'member_removed',
        'role_updated',
        'github_sync',
        'recommendation_generated',
        'recommendation_accepted',
        'recommendation_rejected',
        'project_updated',
      ],
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      enum: ['task', 'project', 'member', 'github', 'recommendation', 'comment'],
      default: 'task',
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
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

activitySchema.index({ project: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);
