const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { createNotification } = require('../services/notificationService');

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
// @desc    Get project summary dashboard metrics (tasks, progress, overdue, activity)
// @access  Private
router.get('/:id/dashboard', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar skills')
      .populate('members.user', 'name email avatar skills');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const userRole = getProjectRole(project, req.user._id);
    if (!userRole) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email avatar skills')
      .sort({ dueDate: 1 });

    const now = new Date();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
    const todoTasks = tasks.filter((t) => t.status === 'todo').length;
    const backlogTasks = tasks.filter((t) => t.status === 'backlog').length;
    const reviewTasks = tasks.filter((t) => t.status === 'review').length;
    const pendingTasks = totalTasks - completedTasks;
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed'
    ).length;

    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Upcoming deadlines in next 7 days
    const upcomingDeadlines = tasks
      .filter((t) => t.dueDate && new Date(t.dueDate) >= now && t.status !== 'completed')
      .slice(0, 5);

    // Recent activity
    const recentActivity = await Activity.find({ project: project._id })
      .populate('user', 'name email avatar')
      .sort({ timestamp: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      metrics: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        todoTasks,
        backlogTasks,
        reviewTasks,
        overdueTasks,
        progress,
        memberCount: (project.members?.length || 0) + (project.owner ? 0 : 1),
        upcomingDeadlines,
        recentActivity,
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
