const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { createNotification } = require('../services/notificationService');

router.use(protect);

// @route   GET /api/tasks/project/:projectId
// @desc    Get all tasks for a project with optional filtering and search
// @access  Private
router.get('/project/:projectId', async (req, res) => {
  try {
    const { status, priority, member, search, sort = 'dueDate' } = req.query;

    const query = { project: req.params.projectId };

    if (status && status !== 'all') {
      query.status = status;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (member && member !== 'all') {
      query.assignedTo = member === 'unassigned' ? null : member;
    }
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } },
      ];
    }

    let sortOptions = { order: 1, createdAt: -1 };
    if (sort === 'dueDate') sortOptions = { dueDate: 1, priority: -1 };
    if (sort === 'priority') sortOptions = { priority: -1, dueDate: 1 };
    if (sort === 'newest') sortOptions = { createdAt: -1 };

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar skills')
      .populate('createdBy', 'name email avatar')
      .sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching tasks',
    });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task in a project
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      project: projectId,
      assignedTo,
      priority = 'medium',
      difficulty = 'medium',
      estimatedHours,
      status = 'todo',
      dueDate,
      tags,
      requiredSkills,
    } = req.body;

    if (!title || !title.trim() || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Task title and project ID are required',
      });
    }

    const projectDoc = await Project.findById(projectId);
    if (!projectDoc) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority,
      difficulty,
      estimatedHours: estimatedHours || 2,
      status,
      dueDate: dueDate || null,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : []),
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean) : []),
    });

    // Populate for response
    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar skills')
      .populate('createdBy', 'name email avatar');

    // Record Activity
    let activityDesc = `${req.user.name} created task "${task.title}"`;
    if (populated.assignedTo) {
      activityDesc += ` and assigned it to ${populated.assignedTo.name}`;
    }

    await Activity.create({
      project: projectId,
      user: req.user._id,
      actionType: 'task_created',
      description: activityDesc,
      entityType: 'task',
      entityId: task._id,
    });

    // Send Notification to assignee
    if (populated.assignedTo && populated.assignedTo._id.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: populated.assignedTo._id,
        sender: req.user._id,
        project: projectId,
        type: 'task_assignment',
        title: 'New Task Assigned',
        message: `${req.user.name} assigned you to "${task.title}" in ${projectDoc.name}`,
        link: `/project/${projectId}`,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: populated,
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating task',
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task details
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar skills')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name owner members');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Get task error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving task',
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task details (title, description, assignee, priority, difficulty, status, dueDate)
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const {
      title,
      description,
      assignedTo,
      priority,
      difficulty,
      estimatedHours,
      status,
      dueDate,
      tags,
      requiredSkills,
    } = req.body;

    const previousAssignee = task.assignedTo ? task.assignedTo.toString() : null;
    const previousStatus = task.status;

    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (priority) task.priority = priority;
    if (difficulty) task.difficulty = difficulty;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (status) {
      task.status = status;
      if (status === 'completed' && previousStatus !== 'completed') {
        task.completedAt = new Date();
      } else if (status !== 'completed') {
        task.completedAt = null;
      }
    }
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (tags !== undefined) {
      task.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (requiredSkills !== undefined) {
      task.requiredSkills = Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar skills')
      .populate('createdBy', 'name email avatar');

    // Activity & Notification logic
    const newAssignee = task.assignedTo ? task.assignedTo.toString() : null;
    if (newAssignee && newAssignee !== previousAssignee) {
      await Activity.create({
        project: task.project,
        user: req.user._id,
        actionType: 'task_assigned',
        description: `${req.user.name} reassigned "${task.title}" to ${populated.assignedTo?.name || 'team member'}`,
        entityType: 'task',
        entityId: task._id,
      });

      if (newAssignee !== req.user._id.toString()) {
        await createNotification({
          recipient: newAssignee,
          sender: req.user._id,
          project: task.project,
          type: 'task_assignment',
          title: 'Task Reassigned to You',
          message: `${req.user.name} assigned you to "${task.title}"`,
          link: `/project/${task.project}`,
        });
      }
    } else if (status && status !== previousStatus) {
      await Activity.create({
        project: task.project,
        user: req.user._id,
        actionType: status === 'completed' ? 'task_completed' : 'task_status_changed',
        description: `${req.user.name} moved "${task.title}" from ${previousStatus} to ${status}`,
        entityType: 'task',
        entityId: task._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: populated,
    });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating task',
    });
  }
});

// @route   PUT /api/tasks/:id/status
// @desc    Fast status shift (Kanban drag / click)
// @access  Private
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const prevStatus = task.status;
    task.status = status;
    if (status === 'completed') {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }

    await task.save();

    await Activity.create({
      project: task.project,
      user: req.user._id,
      actionType: status === 'completed' ? 'task_completed' : 'task_status_changed',
      description: `${req.user.name} moved "${task.title}" to ${status}`,
      entityType: 'task',
      entityId: task._id,
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar skills')
      .populate('createdBy', 'name email avatar');

    return res.status(200).json({
      success: true,
      message: `Status changed to ${status}`,
      task: populated,
    });
  } catch (error) {
    console.error('Status shift error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating task status',
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const projectId = task.project;
    const taskTitle = task.title;

    await Comment.deleteMany({ task: task._id });
    await Task.findByIdAndDelete(req.params.id);

    await Activity.create({
      project: projectId,
      user: req.user._id,
      actionType: 'task_updated',
      description: `${req.user.name} deleted task "${taskTitle}"`,
      entityType: 'task',
    });

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting task',
    });
  }
});

// @route   GET /api/tasks/:id/comments
// @desc    Get comments for a task
// @access  Private
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.id })
      .populate('user', 'name email avatar')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    console.error('Fetch comments error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching comments',
    });
  }
});

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to a task
// @access  Private
router.post('/:id/comments', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const task = await Task.findById(req.params.id).populate('project', 'name');
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const comment = await Comment.create({
      task: task._id,
      project: task.project._id || task.project,
      user: req.user._id,
      content: content.trim(),
    });

    // Record Activity
    await Activity.create({
      project: task.project._id || task.project,
      user: req.user._id,
      actionType: 'comment_added',
      description: `${req.user.name} commented on "${task.title}": "${content.trim().substring(0, 60)}${content.length > 60 ? '...' : ''}"`,
      entityType: 'comment',
      entityId: comment._id,
    });

    // Notify assignee if someone else commented
    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: task.assignedTo,
        sender: req.user._id,
        project: task.project._id || task.project,
        type: 'comment',
        title: 'New Comment on Your Task',
        message: `${req.user.name} commented on "${task.title}"`,
        link: `/project/${task.project._id || task.project}`,
      });
    }

    const populated = await Comment.findById(comment._id).populate('user', 'name email avatar');

    return res.status(201).json({
      success: true,
      comment: populated,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error adding comment',
    });
  }
});

// @route   DELETE /api/tasks/comments/:commentId
// @desc    Delete own comment
// @access  Private
router.delete('/comments/:commentId', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Can only delete your own comment' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting comment',
    });
  }
});

module.exports = router;
