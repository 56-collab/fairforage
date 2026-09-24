const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect } = require('../middleware/authMiddleware');

// All project routes are protected
router.use(protect);

// @route   GET /api/projects
// @desc    Get all projects for the logged in user (owned or member)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
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
    const { name, description, tags, status } = req.body;

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
      status: status || 'active',
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'lead',
          joinedAt: new Date(),
        },
      ],
    });

    const populatedProject = await Project.findById(newProject._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

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
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user is owner or member
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (m) => m.user && m.user._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project',
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error('Get project error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving project',
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project details
// @access  Private (Owner or Lead)
router.put('/:id', async (req, res) => {
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
        message: 'Only the project owner can update project details',
      });
    }

    const { name, description, status, tags } = req.body;
    if (name) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();
    if (status) project.status = status;
    if (tags !== undefined) {
      project.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

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

// @route   DELETE /api/projects/:id
// @desc    Delete project
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

    await Project.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
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
