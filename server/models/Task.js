const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [150, 'Task title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      default: 'medium',
    },
    estimatedHours: {
      type: Number,
      default: 2,
      min: 0.5,
      max: 200,
    },
    status: {
      type: String,
      enum: ['backlog', 'todo', 'in-progress', 'review', 'completed'],
      default: 'todo',
      index: true,
    },
    dueDate: {
      type: Date,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    tags: {
      type: [String],
      default: [],
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for difficulty numeric weight (easy=1, medium=2, hard=3, expert=5)
taskSchema.virtual('difficultyWeight').get(function () {
  const map = { easy: 1, medium: 2, hard: 3, expert: 5 };
  return map[this.difficulty] || 2;
});

// Virtual for priority numeric weight (low=1, medium=2, high=3, critical=4)
taskSchema.virtual('priorityWeight').get(function () {
  const map = { low: 1, medium: 2, high: 3, critical: 4 };
  return map[this.priority] || 2;
});

taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
