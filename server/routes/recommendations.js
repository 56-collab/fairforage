const express = require('express');
const router = express.Router();
const Recommendation = require('../models/Recommendation');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/authMiddleware');
const { generateRedistributionRecommendations } = require('../services/analyticsService');
const { createNotification } = require('../services/notificationService');

router.use(protect);

// @route   GET /api/recommendations/project/:projectId
// @desc    Get recommendations for a project
// @access  Private
router.get('/project/:projectId', async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const query = { project: req.params.projectId };
    if (status !== 'all') {
      query.status = status;
    }

    const recommendations = await Recommendation.find(query)
      .populate('task', 'title priority difficulty status dueDate requiredSkills')
      .populate('fromMember', 'name email avatar')
      .populate('toMember', 'name email avatar skills')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error('Fetch recommendations error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching recommendations',
    });
  }
});

// @route   POST /api/recommendations/generate/:projectId
// @desc    Analyze workload and generate fresh redistribution suggestions
// @access  Private
router.post('/generate/:projectId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const recommendations = await generateRedistributionRecommendations(project);

    return res.status(200).json({
      success: true,
      message: `Generated ${recommendations.length} redistribution recommendation(s)`,
      recommendations,
    });
  } catch (error) {
    console.error('Generate recommendations error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error generating recommendations',
    });
  }
});

// @route   POST /api/recommendations/:id/accept
// @desc    Accept task redistribution recommendation (actually updates task assignment in DB)
// @access  Private
router.post('/:id/accept', async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id)
      .populate('task')
      .populate('fromMember', 'name email')
      .populate('toMember', 'name email');

    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    if (recommendation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Recommendation has already been ${recommendation.status}`,
      });
    }

    // 1. Update Task Assigned Member
    const task = await Task.findById(recommendation.task._id);
    if (task) {
      task.assignedTo = recommendation.toMember._id;
      await task.save();
    }

    // 2. Mark Recommendation as Accepted
    recommendation.status = 'accepted';
    recommendation.resolvedBy = req.user._id;
    recommendation.resolvedAt = new Date();
    await recommendation.save();

    // 3. Log Activity
    await Activity.create({
      project: recommendation.project,
      user: req.user._id,
      actionType: 'recommendation_accepted',
      description: `${req.user.name} accepted workload recommendation: Reassigned "${task?.title || 'task'}" from ${recommendation.fromMember.name} to ${recommendation.toMember.name}`,
      entityType: 'recommendation',
      entityId: recommendation._id,
    });

    // 4. Notify both members
    await createNotification({
      recipient: recommendation.toMember._id,
      sender: req.user._id,
      project: recommendation.project,
      type: 'task_assignment',
      title: 'Task Reassigned to Balance Workload',
      message: `You were assigned "${task?.title}" following team workload optimization`,
      link: `/project/${recommendation.project}`,
    });

    await createNotification({
      recipient: recommendation.fromMember._id,
      sender: req.user._id,
      project: recommendation.project,
      type: 'workload_warning',
      title: 'Workload Rebalanced',
      message: `Task "${task?.title}" was reassigned to ${recommendation.toMember.name} to balance team load`,
      link: `/project/${recommendation.project}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Recommendation accepted and task reassigned successfully',
      recommendation,
    });
  } catch (error) {
    console.error('Accept recommendation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error accepting recommendation',
    });
  }
});

// @route   POST /api/recommendations/:id/dismiss
// @desc    Dismiss or reject recommendation
// @access  Private
router.post('/:id/dismiss', async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id);
    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    recommendation.status = 'dismissed';
    recommendation.resolvedBy = req.user._id;
    recommendation.resolvedAt = new Date();
    await recommendation.save();

    return res.status(200).json({
      success: true,
      message: 'Recommendation dismissed',
      recommendation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
