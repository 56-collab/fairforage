const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const GitHubActivity = require('../models/GitHubActivity');
const { protect } = require('../middleware/authMiddleware');
const { calculateActivityIndex, analyzeWorkload } = require('../services/analyticsService');

router.use(protect);

// @route   GET /api/analytics/project/:projectId
// @desc    Get Contribution Activity Index & breakdown for project
// @access  Private
router.get('/project/:projectId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const analytics = await calculateActivityIndex(project);

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('Project analytics error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error computing contribution analytics',
    });
  }
});

// @route   GET /api/analytics/workload/:projectId
// @desc    Get workload distribution & imbalance analysis
// @access  Private
router.get('/workload/:projectId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const workloadAnalysis = await analyzeWorkload(project);

    return res.status(200).json({
      success: true,
      workloadAnalysis,
    });
  } catch (error) {
    console.error('Workload analytics error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error analyzing workload balance',
    });
  }
});

// @route   GET /api/analytics/my-stats
// @desc    Get individual member statistics across all projects
// @access  Private
router.get('/my-stats', async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user's assigned tasks
    const myTasks = await Task.find({ assignedTo: userId })
      .populate('project', 'name status deadline')
      .sort({ dueDate: 1 });

    const now = new Date();
    const totalAssigned = myTasks.length;
    const completedTasks = myTasks.filter((t) => t.status === 'completed');
    const activeTasks = myTasks.filter((t) => t.status !== 'completed');
    const overdueTasks = activeTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now);

    // Calculate personal active workload points
    const myWorkloadScore = activeTasks.reduce((acc, t) => {
      const diff = t.difficulty === 'expert' ? 5 : t.difficulty === 'hard' ? 3 : t.difficulty === 'medium' ? 2 : 1;
      const prio = t.priority === 'critical' ? 3 : t.priority === 'high' ? 2 : 1;
      return acc + diff * prio;
    }, 0);

    // Fetch personal GitHub contributions
    const myGitActivity = await GitHubActivity.find({ fairforgeUser: userId });

    // Recent activities performed by user
    const recentActivities = await Activity.find({ user: userId })
      .populate('project', 'name')
      .sort({ timestamp: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      stats: {
        totalAssigned,
        completedCount: completedTasks.length,
        activeCount: activeTasks.length,
        overdueCount: overdueTasks.length,
        workloadScore: myWorkloadScore,
        commitsCount: myGitActivity.filter((g) => g.type === 'commit').length,
        prsCount: myGitActivity.filter((g) => g.type === 'pull_request').length,
        activeTasks,
        completedTasks: completedTasks.slice(0, 5),
        recentActivities,
      },
    });
  } catch (error) {
    console.error('My stats error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error loading personal stats',
    });
  }
});

module.exports = router;
