const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const GitHubActivity = require('../models/GitHubActivity');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/authMiddleware');
const { fetchRepoDetails, fetchContributors, syncProjectGitHub } = require('../services/githubService');

router.use(protect);

// @route   POST /api/github/connect/:projectId
// @desc    Connect a GitHub repository to a project
// @access  Private
router.post('/connect/:projectId', async (req, res) => {
  try {
    const { repoUrl, owner, repo, branch = 'main' } = req.body;
    let targetOwner = owner;
    let targetRepo = repo;

    // Parse URL if provided (e.g. https://github.com/facebook/react)
    if (repoUrl && !owner && !repo) {
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
      if (match) {
        targetOwner = match[1];
        targetRepo = match[2];
      }
    }

    if (!targetOwner || !targetRepo) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid GitHub repository owner and name (e.g. 56-collab/fairforage)',
      });
    }

    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Verify repository existence on GitHub
    const repoInfo = await fetchRepoDetails(targetOwner, targetRepo);

    project.githubRepo = {
      owner: targetOwner,
      repo: targetRepo,
      branch: branch || repoInfo.default_branch || 'main',
      isConnected: true,
      lastSyncedAt: new Date(),
      contributorMapping: project.githubRepo?.contributorMapping || [],
    };

    await project.save();

    // Trigger initial background sync
    syncProjectGitHub(project).catch((err) =>
      console.warn('[GitHub Initial Sync Error]', err.message)
    );

    // Record Activity
    await Activity.create({
      project: project._id,
      user: req.user._id,
      actionType: 'github_sync',
      description: `${req.user.name} connected GitHub repository "${targetOwner}/${targetRepo}"`,
      entityType: 'github',
    });

    return res.status(200).json({
      success: true,
      message: `Successfully connected GitHub repository ${targetOwner}/${targetRepo}`,
      githubRepo: project.githubRepo,
      repoDetails: {
        stars: repoInfo.stargazers_count,
        forks: repoInfo.forks_count,
        openIssues: repoInfo.open_issues_count,
        description: repoInfo.description,
      },
    });
  } catch (error) {
    console.error('Connect GitHub error:', error);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to connect GitHub repository',
    });
  }
});

// @route   POST /api/github/sync/:projectId
// @desc    Manually sync repository activity
// @access  Private
router.post('/sync/:projectId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project || !project.githubRepo?.isConnected) {
      return res.status(400).json({ success: false, message: 'No active GitHub repository connected' });
    }

    const result = await syncProjectGitHub(project);

    await Activity.create({
      project: project._id,
      user: req.user._id,
      actionType: 'github_sync',
      description: `${req.user.name} synced GitHub activity (${result.commits} commits, ${result.pullRequests} PRs, ${result.issues} issues)`,
      entityType: 'github',
    });

    return res.status(200).json({
      success: true,
      message: 'GitHub repository activity synchronized successfully',
      result,
    });
  } catch (error) {
    console.error('Sync GitHub error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to synchronize repository activity',
    });
  }
});

// @route   GET /api/github/activity/:projectId
// @desc    Get repository activity & contributors
// @access  Private
router.get('/activity/:projectId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const activities = await GitHubActivity.find({ project: req.params.projectId })
      .populate('fairforgeUser', 'name email avatar')
      .sort({ timestamp: -1 })
      .limit(60);

    const contributors = project.githubRepo?.isConnected
      ? await fetchContributors(project.githubRepo.owner, project.githubRepo.repo)
      : [];

    return res.status(200).json({
      success: true,
      githubRepo: project.githubRepo,
      activities,
      contributors,
    });
  } catch (error) {
    console.error('Fetch GitHub activity error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching GitHub activity',
    });
  }
});

// @route   POST /api/github/map-contributor/:projectId
// @desc    Map a GitHub username to a FairForge user
// @access  Private
router.post('/map-contributor/:projectId', async (req, res) => {
  try {
    const { githubUser, fairforgeUserId } = req.body;
    if (!githubUser || !fairforgeUserId) {
      return res.status(400).json({ success: false, message: 'githubUser and fairforgeUserId are required' });
    }

    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Remove existing mapping for this github username if any
    project.githubRepo.contributorMapping = (project.githubRepo.contributorMapping || []).filter(
      (m) => m.githubUser.toLowerCase() !== githubUser.toLowerCase()
    );

    project.githubRepo.contributorMapping.push({
      githubUser: githubUser.trim(),
      fairforgeUser: fairforgeUserId,
    });

    await project.save();

    // Update existing activities in db for this user
    await GitHubActivity.updateMany(
      { project: project._id, githubAuthor: { $regex: new RegExp(`^${githubUser}$`, 'i') } },
      { fairforgeUser: fairforgeUserId }
    );

    return res.status(200).json({
      success: true,
      message: `Mapped GitHub user "${githubUser}" to team member`,
      contributorMapping: project.githubRepo.contributorMapping,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/github/disconnect/:projectId
// @desc    Disconnect repository
// @access  Private
router.delete('/disconnect/:projectId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.githubRepo = {
      owner: '',
      repo: '',
      branch: 'main',
      isConnected: false,
      contributorMapping: [],
    };

    await project.save();

    return res.status(200).json({
      success: true,
      message: 'GitHub repository disconnected successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
