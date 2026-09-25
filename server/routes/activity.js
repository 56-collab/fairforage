const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// @route   GET /api/activity/project/:projectId
// @desc    Get chronological activity feed for a project
// @access  Private
router.get('/project/:projectId', async (req, res) => {
  try {
    const { limit = 30, actionType, user } = req.query;

    const query = { project: req.params.projectId };
    if (actionType && actionType !== 'all') {
      query.actionType = actionType;
    }
    if (user && user !== 'all') {
      query.user = user;
    }

    const activities = await Activity.find(query)
      .populate('user', 'name email avatar')
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error('Fetch activity error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching activity',
    });
  }
});

module.exports = router;
