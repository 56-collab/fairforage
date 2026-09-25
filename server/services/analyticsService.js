const Task = require('../models/Task');
const GitHubActivity = require('../models/GitHubActivity');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const Recommendation = require('../models/Recommendation');
const User = require('../models/User');

/**
 * Calculate transparent Contribution Activity Index for all project members
 */
const calculateActivityIndex = async (project) => {
  const projectId = project._id;

  // 1. Gather all project members
  const memberIds = [
    project.owner._id || project.owner,
    ...(project.members || []).map((m) => m.user._id || m.user),
  ].filter(Boolean);

  const uniqueMemberIds = [...new Set(memberIds.map((id) => id.toString()))];
  const members = await User.find({ _id: { $in: uniqueMemberIds } }).select('name email avatar githubUsername skills');

  // 2. Fetch all project tasks
  const allTasks = await Task.find({ project: projectId });

  // 3. Fetch all comments in project
  const allComments = await Comment.find({ project: projectId });

  // 4. Fetch all GitHub activity for project
  const allGitHubActivity = await GitHubActivity.find({ project: projectId });

  // 5. Configurable weights (default sum = 100)
  const weights = {
    taskCompletion: project.analyticsConfig?.taskWeight || 35,
    taskDifficulty: project.analyticsConfig?.difficultyWeight || 20,
    gitActivity: project.analyticsConfig?.githubWeight || 25,
    collaboration: project.analyticsConfig?.collaborationWeight || 10,
    reviewAndIssues: project.analyticsConfig?.reviewWeight || 10,
  };

  const memberStats = {};

  uniqueMemberIds.forEach((id) => {
    memberStats[id] = {
      user: members.find((m) => m._id.toString() === id) || { _id: id, name: 'Member' },
      tasksCompleted: 0,
      tasksActive: 0,
      taskPoints: 0,
      onTimeCompletions: 0,
      overdueTasks: 0,
      commitsCount: 0,
      prsCount: 0,
      issuesCount: 0,
      commentsCount: 0,
      rawScores: {
        tasks: 0,
        difficulty: 0,
        git: 0,
        collaboration: 0,
        reviews: 0,
      },
      activityIndex: 0,
      breakdown: {},
    };
  });

  const now = new Date();

  // Process Tasks
  allTasks.forEach((task) => {
    if (!task.assignedTo) return;
    const userId = task.assignedTo.toString();
    if (!memberStats[userId]) return;

    const diffWeight = task.difficulty === 'expert' ? 5 : task.difficulty === 'hard' ? 3 : task.difficulty === 'medium' ? 2 : 1;
    const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed';

    if (task.status === 'completed') {
      memberStats[userId].tasksCompleted += 1;
      memberStats[userId].taskPoints += diffWeight;

      if (task.dueDate && task.completedAt && new Date(task.completedAt) <= new Date(task.dueDate)) {
        memberStats[userId].onTimeCompletions += 1;
      }
    } else {
      memberStats[userId].tasksActive += 1;
      if (isOverdue) {
        memberStats[userId].overdueTasks += 1;
      }
    }
  });

  // Process Comments
  allComments.forEach((c) => {
    const userId = c.user.toString();
    if (memberStats[userId]) {
      memberStats[userId].commentsCount += 1;
    }
  });

  // Process GitHub Activity
  allGitHubActivity.forEach((ga) => {
    if (ga.fairforgeUser) {
      const userId = ga.fairforgeUser.toString();
      if (memberStats[userId]) {
        if (ga.type === 'commit') memberStats[userId].commitsCount += 1;
        if (ga.type === 'pull_request') memberStats[userId].prsCount += 1;
        if (ga.type === 'issue') memberStats[userId].issuesCount += 1;
      }
    }
  });

  // Calculate raw points and max points for normalization
  let maxTaskScore = 1;
  let maxGitScore = 1;
  let maxCollabScore = 1;

  Object.values(memberStats).forEach((stat) => {
    stat.rawScores.tasks = stat.tasksCompleted;
    stat.rawScores.difficulty = stat.taskPoints;
    stat.rawScores.git = stat.commitsCount * 1.5 + stat.prsCount * 3 + stat.issuesCount * 1;
    stat.rawScores.collaboration = stat.commentsCount;

    if (stat.rawScores.tasks > maxTaskScore) maxTaskScore = stat.rawScores.tasks;
    if (stat.rawScores.git > maxGitScore) maxGitScore = stat.rawScores.git;
    if (stat.rawScores.collaboration > maxCollabScore) maxCollabScore = stat.rawScores.collaboration;
  });

  // Compute final Activity Index (0..100) per member
  let totalTeamPoints = 0;
  const results = Object.values(memberStats).map((stat) => {
    const taskPart = (stat.rawScores.tasks / maxTaskScore) * weights.taskCompletion;
    const diffPart = (stat.rawScores.difficulty / (maxTaskScore * 3 || 1)) * weights.taskDifficulty;
    const gitPart = (stat.rawScores.git / maxGitScore) * weights.gitActivity;
    const collabPart = (stat.rawScores.collaboration / maxCollabScore) * weights.collaboration;

    const rawIndex = Math.min(100, Math.round(taskPart + diffPart + gitPart + collabPart));
    stat.activityIndex = rawIndex;
    totalTeamPoints += rawIndex;

    stat.breakdown = {
      taskCompletionPoints: Math.round(taskPart),
      taskDifficultyPoints: Math.round(diffPart),
      gitActivityPoints: Math.round(gitPart),
      collaborationPoints: Math.round(collabPart),
      formula: `${weights.taskCompletion}% Tasks + ${weights.taskDifficulty}% Difficulty + ${weights.gitActivity}% Git + ${weights.collaboration}% Collaboration`,
    };

    return stat;
  });

  // Calculate relative contribution share %
  results.forEach((r) => {
    r.contributionSharePercentage = totalTeamPoints > 0 ? Math.round((r.activityIndex / totalTeamPoints) * 100) : Math.round(100 / (results.length || 1));
  });

  return {
    members: results,
    weights,
    totalTasks: allTasks.length,
    completedTasks: allTasks.filter((t) => t.status === 'completed').length,
    totalCommits: allGitHubActivity.filter((g) => g.type === 'commit').length,
    totalPRs: allGitHubActivity.filter((g) => g.type === 'pull_request').length,
  };
};

/**
 * Rule-based Workload Imbalance Engine
 */
const analyzeWorkload = async (project) => {
  const projectId = project._id;
  const allTasks = await Task.find({ project: projectId, status: { $ne: 'completed' } }).populate('assignedTo', 'name email skills avatar');
  
  const memberIds = [
    project.owner._id || project.owner,
    ...(project.members || []).map((m) => m.user._id || m.user),
  ].filter(Boolean);

  const uniqueMemberIds = [...new Set(memberIds.map((id) => id.toString()))];
  const members = await User.find({ _id: { $in: uniqueMemberIds } }).select('name email skills avatar');

  const memberWorkload = {};
  uniqueMemberIds.forEach((id) => {
    memberWorkload[id] = {
      user: members.find((m) => m._id.toString() === id) || { _id: id, name: 'Member' },
      activeTasksCount: 0,
      workloadScore: 0,
      overdueTasksCount: 0,
      criticalTasksCount: 0,
      tasks: [],
    };
  });

  const now = new Date();

  allTasks.forEach((task) => {
    if (!task.assignedTo) return;
    const userId = task.assignedTo._id ? task.assignedTo._id.toString() : task.assignedTo.toString();
    if (!memberWorkload[userId]) return;

    const diffWeight = task.difficulty === 'expert' ? 5 : task.difficulty === 'hard' ? 3 : task.difficulty === 'medium' ? 2 : 1;
    const prioWeight = task.priority === 'critical' ? 3 : task.priority === 'high' ? 2 : 1;
    const taskLoad = diffWeight * prioWeight;

    const isOverdue = task.dueDate && new Date(task.dueDate) < now;

    memberWorkload[userId].activeTasksCount += 1;
    memberWorkload[userId].workloadScore += taskLoad;
    if (isOverdue) memberWorkload[userId].overdueTasksCount += 1;
    if (task.priority === 'critical' || task.priority === 'high') memberWorkload[userId].criticalTasksCount += 1;

    memberWorkload[userId].tasks.push({
      _id: task._id,
      title: task.title,
      priority: task.priority,
      difficulty: task.difficulty,
      dueDate: task.dueDate,
      requiredSkills: task.requiredSkills,
      status: task.status,
      workloadWeight: taskLoad,
    });
  });

  const memberArray = Object.values(memberWorkload);
  const totalWorkload = memberArray.reduce((acc, m) => acc + m.workloadScore, 0);
  const avgWorkload = memberArray.length > 0 ? totalWorkload / memberArray.length : 0;

  const alerts = [];
  const overloadedMembers = [];
  const availableMembers = [];

  memberArray.forEach((m) => {
    m.workloadVsAverage = avgWorkload > 0 ? Math.round((m.workloadScore / avgWorkload) * 100) : 100;
    
    // Status classification: Overloaded, High, Balanced, Available
    if (m.workloadScore >= avgWorkload * 1.4 && m.workloadScore > 5) {
      m.status = 'overloaded';
      overloadedMembers.push(m);
      alerts.push({
        type: 'warning',
        member: m.user.name,
        message: `Potential workload imbalance detected. ${m.user.name} currently holds ${m.workloadScore} workload points (${m.workloadVsAverage}% of team average) with ${m.activeTasksCount} active tasks${m.overdueTasksCount > 0 ? ` and ${m.overdueTasksCount} overdue tasks` : ''}.`,
      });
    } else if (m.workloadScore <= avgWorkload * 0.5 && m.activeTasksCount <= 2) {
      m.status = 'available';
      availableMembers.push(m);
    } else if (m.workloadScore > avgWorkload * 1.1) {
      m.status = 'high';
    } else {
      m.status = 'balanced';
    }
  });

  const isBalanced = overloadedMembers.length === 0;

  return {
    isBalanced,
    avgWorkload: Math.round(avgWorkload * 10) / 10,
    totalActiveTasks: allTasks.length,
    alerts,
    memberWorkloads: memberArray,
    overloadedMembers,
    availableMembers,
  };
};

/**
 * Task Redistribution Recommendation Generator
 */
const generateRedistributionRecommendations = async (project) => {
  const workloadAnalysis = await analyzeWorkload(project);
  const { overloadedMembers, availableMembers } = workloadAnalysis;

  if (overloadedMembers.length === 0 || availableMembers.length === 0) {
    return [];
  }

  const recommendations = [];

  for (const overloaded of overloadedMembers) {
    // Look for candidates to reassign (prefer todo or backlog tasks with upcoming deadlines)
    const reassignableTasks = overloaded.tasks.filter((t) => t.status === 'todo' || t.status === 'backlog');

    for (const task of reassignableTasks) {
      // Find best matching available member
      for (const available of availableMembers) {
        if (available.user._id.toString() === overloaded.user._id.toString()) continue;

        // Calculate skill match
        const taskSkills = task.requiredSkills || [];
        const memberSkills = available.user.skills || [];
        const matchingSkills = taskSkills.filter((s) =>
          memberSkills.some((ms) => ms.toLowerCase() === s.toLowerCase())
        );

        const skillScore = taskSkills.length > 0 ? (matchingSkills.length / taskSkills.length) * 40 : 20;
        const capacityScore = Math.max(0, 50 - available.workloadScore * 5);
        const confidenceScore = Math.min(95, Math.round(skillScore + capacityScore + 10));

        let reason = `${available.user.name} currently has high capacity with only ${available.activeTasksCount} active task(s).`;
        if (matchingSkills.length > 0) {
          reason += ` They also possess matching skill(s): ${matchingSkills.join(', ')}.`;
        }

        const impact = `Reassigning "${task.title}" reduces ${overloaded.user.name}'s workload by ${task.workloadWeight} pts and balances team velocity.`;

        // Check if recommendation already exists
        const existing = await Recommendation.findOne({
          project: project._id,
          task: task._id,
          status: 'pending',
        });

        if (!existing) {
          const rec = await Recommendation.create({
            project: project._id,
            task: task._id,
            fromMember: overloaded.user._id,
            toMember: available.user._id,
            reason,
            impact,
            confidenceScore,
            status: 'pending',
          });
          recommendations.push(rec);
        } else {
          recommendations.push(existing);
        }

        // Limit to 1 recommendation per overloaded member per cycle for clarity
        break;
      }
    }
  }

  return Recommendation.find({ project: project._id, status: 'pending' })
    .populate('task', 'title priority difficulty status dueDate requiredSkills')
    .populate('fromMember', 'name email avatar')
    .populate('toMember', 'name email avatar skills');
};

module.exports = {
  calculateActivityIndex,
  analyzeWorkload,
  generateRedistributionRecommendations,
};
