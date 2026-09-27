const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const User = require('../models/User');
const GitHubActivity = require('../models/GitHubActivity');
const Recommendation = require('../models/Recommendation');
const { protect } = require('../middleware/authMiddleware');
const { createNotification } = require('../services/notificationService');
const { 
  calculateActivityIndex, 
  analyzeWorkload, 
  generateRedistributionRecommendations 
} = require('../services/analyticsService');

// All project routes are protected
router.use(protect);

// Helper to check user permission in project
const getProjectRole = (project, userId) => {
  if (project.owner._id ? project.owner._id.toString() === userId.toString() : project.owner.toString() === userId.toString()) {
    return 'owner';
  }
  const member = project.members.find(
    (m) => (m.user._id ? m.user._id.toString() : m.user.toString()) === userId.toString()
  );
  return member ? member.role : null;
};

// @route   GET /api/projects
// @desc    Get all projects for the logged in user (owned or member)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    })
      .populate('owner', 'name email avatar skills githubUsername')
      .populate('members.user', 'name email avatar skills githubUsername')
      .sort({ updatedAt: -1 });

    // Attach task count summaries for each project
    const projectIds = projects.map((p) => p._id);
    const tasks = await Task.find({ project: { $in: projectIds } });

    const enriched = projects.map((p) => {
      const pTasks = tasks.filter((t) => t.project.toString() === p._id.toString());
      const completed = pTasks.filter((t) => t.status === 'completed').length;
      const total = pTasks.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      const obj = p.toObject();
      obj.taskCount = total;
      obj.completedTaskCount = completed;
      obj.progress = progress;
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: enriched.length,
      projects: enriched,
    });
  } catch (error) {
    console.error('Fetch projects error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching projects',
    });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { name, description, tags, techStack, status, startDate, deadline } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required',
      });
    }

    const newProject = await Project.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : []),
      techStack: Array.isArray(techStack) ? techStack : (techStack ? techStack.split(',').map((t) => t.trim()).filter(Boolean) : []),
      status: status || 'active',
      startDate: startDate || new Date(),
      deadline: deadline || null,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
    });

    // Record creation activity
    await Activity.create({
      project: newProject._id,
      user: req.user._id,
      actionType: 'project_updated',
      description: `${req.user.name} created the project "${newProject.name}"`,
      entityType: 'project',
      entityId: newProject._id,
    });

    const populatedProject = await Project.findById(newProject._id)
      .populate('owner', 'name email avatar skills githubUsername')
      .populate('members.user', 'name email avatar skills githubUsername');

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: populatedProject,
    });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating project',
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project details by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar skills githubUsername')
      .populate('members.user', 'name email avatar skills githubUsername');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const userRole = getProjectRole(project, req.user._id);
    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project',
      });
    }

    const projectObj = project.toObject();
    projectObj.currentUserRole = userRole;

    return res.status(200).json({
      success: true,
      project: projectObj,
    });
  } catch (error) {
    console.error('Get project error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving project',
    });
  }
});

// @route   GET /api/projects/:id/dashboard
// @desc    Get complete aggregated intelligence for an individual project
// @access  Private
router.get('/:id/dashboard', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar skills githubUsername')
      .populate('members.user', 'name email avatar skills githubUsername');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const userRole = getProjectRole(project, req.user._id);
    if (!userRole) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email avatar skills githubUsername')
      .sort({ dueDate: 1 });

    const now = new Date();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
    const todoTasks = tasks.filter((t) => t.status === 'todo').length;
    const backlogTasks = tasks.filter((t) => t.status === 'backlog').length;
    const reviewTasks = tasks.filter((t) => t.status === 'review').length;
    const activeTasks = totalTasks - completedTasks;
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed'
    ).length;
    const unassignedTasks = tasks.filter((t) => !t.assignedTo && t.status !== 'completed').length;

    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Deadline calculation
    let daysRemaining = null;
    let deadlineStatusText = 'No deadline set';
    if (project.deadline) {
      const deadlineDate = new Date(project.deadline);
      const diffMs = deadlineDate.setHours(23, 59, 59, 999) - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      daysRemaining = diffDays;
      if (diffDays < 0) {
        deadlineStatusText = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`;
      } else if (diffDays === 0) {
        deadlineStatusText = 'Due today';
      } else {
        deadlineStatusText = `${diffDays} day${diffDays === 1 ? '' : 's'} remaining`;
      }
    }

    // Run Analytics Service
    const [activityIndexData, workloadData, recommendationsData] = await Promise.all([
      calculateActivityIndex(project).catch(() => ({ members: [], weights: {} })),
      analyzeWorkload(project).catch(() => ({ isBalanced: true, memberWorkloads: [], overloadedMembers: [], availableMembers: [], alerts: [] })),
      Recommendation.find({ project: project._id, status: 'pending' })
        .populate('task', 'title priority difficulty status dueDate requiredSkills')
        .populate('fromMember', 'name email avatar skills')
        .populate('toMember', 'name email avatar skills')
        .sort({ confidenceScore: -1 })
        .catch(() => [])
    ]);

    // Workload health evaluation
    let workloadHealthState = 'Balanced';
    let workloadHealthColor = 'success';
    let workloadHealthExplanation = 'Current estimated workload is relatively evenly distributed across active members.';

    if (workloadData.overloadedMembers && workloadData.overloadedMembers.length >= 2) {
      workloadHealthState = 'High Imbalance';
      workloadHealthColor = 'danger';
      workloadHealthExplanation = `${workloadData.overloadedMembers.length} members currently carry a substantially higher active workload than the team median.`;
    } else if (workloadData.overloadedMembers && workloadData.overloadedMembers.length === 1) {
      workloadHealthState = 'Moderate Imbalance';
      workloadHealthColor = 'warning';
      workloadHealthExplanation = `1 member is handling an elevated share of active tasks while other members have available bandwidth.`;
    } else if (tasks.length === 0) {
      workloadHealthState = 'Balanced';
      workloadHealthColor = 'info';
      workloadHealthExplanation = 'No active tasks recorded yet in this project.';
    }

    // Normalizing workload percentages for chart/bars (0-100 scale)
    const maxWorkloadScore = Math.max(1, ...(workloadData.memberWorkloads || []).map((m) => m.workloadScore));
    const normalizedMemberWorkloads = (workloadData.memberWorkloads || []).map((m) => {
      const workloadPercentage = maxWorkloadScore > 0 ? Math.min(100, Math.round((m.workloadScore / maxWorkloadScore) * 100)) : 0;
      return {
        ...m,
        workloadPercentage,
      };
    });

    // Needs Attention rule-based generator
    const attentionItems = [];
    if (overdueTasks > 0) {
      attentionItems.push({
        id: 'overdue-tasks',
        type: 'overdue',
        severity: 'danger',
        title: 'Overdue Tasks',
        description: `${overdueTasks} task${overdueTasks === 1 ? '' : 's'} past the due date require immediate review or rescheduling.`,
        actionText: 'View Overdue Tasks',
        filterStatus: 'overdue',
      });
    }

    if (workloadHealthState !== 'Balanced' && workloadData.overloadedMembers?.length > 0) {
      attentionItems.push({
        id: 'workload-imbalance',
        type: 'imbalance',
        severity: 'warning',
        title: 'Workload Imbalance Detected',
        description: `${workloadData.overloadedMembers.map((m) => m.user.name).join(', ')} currently carry disproportionate task weights. Consider redistributing pending tasks.`,
        actionText: 'Check Recommendations',
        targetSection: 'recommendations',
      });
    }

    if (daysRemaining !== null && daysRemaining <= 3 && activeTasks > 0) {
      attentionItems.push({
        id: 'approaching-deadline',
        type: 'deadline',
        severity: daysRemaining < 0 ? 'danger' : 'warning',
        title: daysRemaining < 0 ? 'Project Deadline Exceeded' : 'Approaching Project Deadline',
        description: daysRemaining < 0
          ? `Project deadline expired ${Math.abs(daysRemaining)} days ago with ${activeTasks} incomplete task(s).`
          : `Project deadline is in ${daysRemaining} day(s) with ${activeTasks} incomplete task(s) remaining.`,
        actionText: 'Review Milestones',
      });
    }

    if (unassignedTasks > 0) {
      attentionItems.push({
        id: 'unassigned-tasks',
        type: 'unassigned',
        severity: 'warning',
        title: 'Unassigned Tasks',
        description: `${unassignedTasks} task${unassignedTasks === 1 ? '' : 's'} do not currently have an assigned team member.`,
        actionText: 'Assign Tasks',
        filterStatus: 'unassigned',
      });
    }

    if (reviewTasks > 0) {
      attentionItems.push({
        id: 'review-tasks',
        type: 'review',
        severity: 'info',
        title: 'Tasks in Review',
        description: `${reviewTasks} task${reviewTasks === 1 ? '' : 's'} awaiting code review or QA acceptance.`,
        actionText: 'Review Tasks',
        filterStatus: 'review',
      });
    }

    // GitHub activity
    const isGithubConnected = Boolean(project.githubRepo?.owner && project.githubRepo?.repo);
    const gitHubActivities = await GitHubActivity.find({ project: project._id })
      .populate('fairforgeUser', 'name email avatar')
      .sort({ timestamp: -1 })
      .limit(15);

    const gitStats = {
      commits: gitHubActivities.filter((g) => g.type === 'commit').length,
      pullRequests: gitHubActivities.filter((g) => g.type === 'pull_request').length,
      reviews: gitHubActivities.filter((g) => g.type === 'review').length,
      issues: gitHubActivities.filter((g) => g.type === 'issue').length,
      totalEvents: gitHubActivities.length,
    };

    // Recent activity audit trail
    const recentActivities = await Activity.find({ project: project._id })
      .populate('user', 'name email avatar')
      .sort({ timestamp: -1 })
      .limit(10);

    // Team member view
    const teamMembers = [
      {
        user: project.owner,
        role: 'owner',
        skills: project.owner?.skills || [],
        activeTasksCount: (workloadData.memberWorkloads?.find((m) => m.user._id.toString() === project.owner._id.toString()))?.activeTasksCount || 0,
        workloadStatus: (workloadData.memberWorkloads?.find((m) => m.user._id.toString() === project.owner._id.toString()))?.status || 'balanced',
      },
      ...(project.members || []).map((m) => ({
        user: m.user,
        role: m.role || 'member',
        skills: m.user?.skills || [],
        activeTasksCount: (workloadData.memberWorkloads?.find((wm) => wm.user._id.toString() === (m.user._id || m.user).toString()))?.activeTasksCount || 0,
        workloadStatus: (workloadData.memberWorkloads?.find((wm) => wm.user._id.toString() === (m.user._id || m.user).toString()))?.status || 'balanced',
      }))
    ];

    const projectObj = project.toObject();
    projectObj.currentUserRole = userRole;

    return res.status(200).json({
      success: true,
      data: {
        project: projectObj,
        metrics: {
          activeTasks,
          completedTasks,
          overdueTasks,
          teamMembers: teamMembers.length,
          workloadHealth: {
            state: workloadHealthState,
            color: workloadHealthColor,
            explanation: workloadHealthExplanation,
          },
          deadline: {
            date: project.deadline,
            daysRemaining,
            statusText: deadlineStatusText,
          },
          unassignedTasks,
          reviewTasks,
        },
        progress: {
          totalTasks,
          completedTasks,
          activeTasks,
          todoTasks,
          inProgressTasks,
          reviewTasks,
          backlogTasks,
          overdueTasks,
          percentage: progressPercentage,
        },
        workload: {
          isBalanced: workloadData.isBalanced,
          avgWorkload: workloadData.avgWorkload,
          members: normalizedMemberWorkloads,
        },
        workloadHealth: {
          state: workloadHealthState,
          color: workloadHealthColor,
          explanation: workloadHealthExplanation,
          overloadedCount: workloadData.overloadedMembers?.length || 0,
          availableCount: workloadData.availableMembers?.length || 0,
        },
        contributionActivity: {
          members: activityIndexData.members || [],
          weights: activityIndexData.weights || {},
          hasGitHub: isGithubConnected,
          explanation: 'Composite activity indicator based on recorded project and repository activity. It is not a direct measure of overall contribution.',
        },
        attentionItems,
        recommendations: recommendationsData,
        team: teamMembers,
        github: {
          connected: isGithubConnected,
          repoName: isGithubConnected ? `${project.githubRepo.owner}/${project.githubRepo.repo}` : '',
          stats: gitStats,
          recentActivity: gitHubActivities.slice(0, 5),
        },
        recentActivity: recentActivities,
      },
    });
  } catch (error) {
    console.error('Project dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error loading dashboard metrics',
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project details
// @access  Private (Owner or Manager)
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const role = getProjectRole(project, req.user._id);
    if (role !== 'owner' && role !== 'manager' && role !== 'lead') {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner or manager can update project settings',
      });
    }

    const { name, description, status, tags, techStack, startDate, deadline, analyticsConfig } = req.body;
    if (name) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();
    if (status) project.status = status;
    if (startDate) project.startDate = startDate;
    if (deadline !== undefined) project.deadline = deadline || null;
    if (tags !== undefined) {
      project.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (techStack !== undefined) {
      project.techStack = Array.isArray(techStack) ? techStack : techStack.split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (analyticsConfig) {
      project.analyticsConfig = { ...project.analyticsConfig, ...analyticsConfig };
    }

    await project.save();

    await Activity.create({
      project: project._id,
      user: req.user._id,
      actionType: 'project_updated',
      description: `${req.user.name} updated project details for "${project.name}"`,
      entityType: 'project',
      entityId: project._id,
    });

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar skills')
      .populate('members.user', 'name email avatar skills');

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject,
    });
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating project',
    });
  }
});

// @route   POST /api/projects/:id/members
// @desc    Add / invite team member to project
// @access  Private (Owner, Manager, or Lead)
router.post('/:id/members', async (req, res) => {
  try {
    const { userId, email, role = 'member' } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const currentRole = getProjectRole(project, req.user._id);
    if (currentRole !== 'owner' && currentRole !== 'manager' && currentRole !== 'lead') {
      return res.status(403).json({
        success: false,
        message: 'Only project leads and managers can invite new members',
      });
    }

    let targetUser = null;
    if (userId) {
      targetUser = await User.findById(userId);
    } else if (email) {
      targetUser = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please ensure they have registered an account first.',
      });
    }

    // Check if user is already in project
    const alreadyMember =
      project.owner.toString() === targetUser._id.toString() ||
      project.members.some((m) => m.user.toString() === targetUser._id.toString());

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: `${targetUser.name} is already a member of this project`,
      });
    }

    project.members.push({
      user: targetUser._id,
      role: role || 'member',
      joinedAt: new Date(),
    });

    await project.save();

    // Log Activity
    await Activity.create({
      project: project._id,
      user: req.user._id,
      actionType: 'member_added',
      description: `${req.user.name} added ${targetUser.name} to the team as ${role}`,
      entityType: 'member',
      entityId: targetUser._id,
    });

    // Notify User
    await createNotification({
      recipient: targetUser._id,
      sender: req.user._id,
      project: project._id,
      type: 'invitation',
      title: 'Added to New Project',
      message: `You have been added to "${project.name}" as a ${role}`,
      link: `/project/${project._id}`,
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar skills')
      .populate('members.user', 'name email avatar skills');

    return res.status(200).json({
      success: true,
      message: `${targetUser.name} was successfully added to the team`,
      project: populatedProject,
    });
  } catch (error) {
    console.error('Add member error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error adding member',
    });
  }
});

// @route   PUT /api/projects/:id/members/:userId/role
// @desc    Update member's role in project
// @access  Private (Owner or Manager)
router.put('/:id/members/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const currentRole = getProjectRole(project, req.user._id);
    if (currentRole !== 'owner' && currentRole !== 'manager') {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.params.userId.toString()
    );

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found in project' });
    }

    member.role = role;
    await project.save();

    await Activity.create({
      project: project._id,
      user: req.user._id,
      actionType: 'role_updated',
      description: `${req.user.name} changed a team member role to ${role}`,
      entityType: 'member',
      entityId: member.user,
    });

    return res.status(200).json({
      success: true,
      message: 'Member role updated successfully',
    });
  } catch (error) {
    console.error('Update role error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating role',
    });
  }
});

// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remove team member from project
// @access  Private (Owner or Manager)
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const currentRole = getProjectRole(project, req.user._id);
    if (currentRole !== 'owner' && currentRole !== 'manager') {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    if (project.owner.toString() === req.params.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the project owner from the team',
      });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId.toString()
    );

    await project.save();

    await Activity.create({
      project: project._id,
      user: req.user._id,
      actionType: 'member_removed',
      description: `${req.user.name} removed a member from the project team`,
      entityType: 'member',
    });

    return res.status(200).json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Remove member error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error removing member',
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete or archive project
// @access  Private (Owner only)
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can delete this project',
      });
    }

    // Clean up associated tasks, comments, activities, recommendations
    await Task.deleteMany({ project: req.params.id });
    await Activity.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Project and all associated resources deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting project',
    });
  }
});

module.exports = router;
