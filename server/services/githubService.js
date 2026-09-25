const axios = require('axios');
const GitHubActivity = require('../models/GitHubActivity');
const User = require('../models/User');

const getGitHubHeaders = () => {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'FairForge-Platform',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
};

const gitHubClient = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 15000,
});

/**
 * Fetch GitHub repository details
 */
const fetchRepoDetails = async (owner, repo) => {
  const res = await gitHubClient.get(`/repos/${owner}/${repo}`, {
    headers: getGitHubHeaders(),
  });
  return res.data;
};

/**
 * Fetch contributors for a repository
 */
const fetchContributors = async (owner, repo) => {
  try {
    const res = await gitHubClient.get(`/repos/${owner}/${repo}/contributors?per_page=30`, {
      headers: getGitHubHeaders(),
    });
    return res.data || [];
  } catch (error) {
    console.warn('[GitHub API Warning] Could not fetch contributors:', error.message);
    return [];
  }
};

/**
 * Synchronize full repository activity for a project
 */
const syncProjectGitHub = async (project) => {
  if (!project.githubRepo || !project.githubRepo.owner || !project.githubRepo.repo) {
    throw new Error('No GitHub repository connected to this project');
  }

  const { owner, repo, contributorMapping = [] } = project.githubRepo;
  const mappingMap = new Map();

  // Load project team members to attempt automatic username / email matching
  const members = project.members.map((m) => m.user);
  const userDocs = await User.find({
    $or: [{ _id: { $in: members } }, { _id: project.owner }],
  });

  userDocs.forEach((u) => {
    if (u.githubUsername) {
      mappingMap.set(u.githubUsername.toLowerCase(), u._id);
    }
  });

  // Also apply manual contributor mappings
  contributorMapping.forEach((m) => {
    if (m.githubUser && m.fairforgeUser) {
      mappingMap.set(m.githubUser.toLowerCase(), m.fairforgeUser);
    }
  });

  const syncedSummary = {
    commits: 0,
    pullRequests: 0,
    issues: 0,
  };

  const headers = getGitHubHeaders();

  // 1. Fetch Commits
  try {
    const commitsRes = await gitHubClient.get(`/repos/${owner}/${repo}/commits?per_page=50`, {
      headers,
    });
    for (const item of commitsRes.data || []) {
      const authorLogin = item.author?.login || item.commit?.author?.name || 'unknown';
      const fairforgeUser = mappingMap.get(authorLogin.toLowerCase()) || null;

      await GitHubActivity.findOneAndUpdate(
        { project: project._id, shaOrId: item.sha },
        {
          project: project._id,
          type: 'commit',
          githubAuthor: authorLogin,
          fairforgeUser,
          title: item.commit.message.split('\n')[0].substring(0, 150),
          description: item.commit.message,
          url: item.html_url,
          shaOrId: item.sha,
          metadata: {
            additions: item.stats?.additions || 0,
            deletions: item.stats?.deletions || 0,
          },
          timestamp: new Date(item.commit.author?.date || item.commit.committer?.date || Date.now()),
        },
        { upsert: true, new: true }
      );
      syncedSummary.commits++;
    }
  } catch (err) {
    console.warn('[GitHub Sync] Error fetching commits:', err.message);
  }

  // 2. Fetch Pull Requests
  try {
    const prsRes = await gitHubClient.get(`/repos/${owner}/${repo}/pulls?state=all&per_page=30`, {
      headers,
    });
    for (const pr of prsRes.data || []) {
      const authorLogin = pr.user?.login || 'unknown';
      const fairforgeUser = mappingMap.get(authorLogin.toLowerCase()) || null;

      await GitHubActivity.findOneAndUpdate(
        { project: project._id, shaOrId: `pr-${pr.id}` },
        {
          project: project._id,
          type: 'pull_request',
          githubAuthor: authorLogin,
          fairforgeUser,
          title: pr.title.substring(0, 150),
          description: pr.body || '',
          url: pr.html_url,
          shaOrId: `pr-${pr.id}`,
          metadata: {
            state: pr.state,
            merged: !!pr.merged_at,
            number: pr.number,
          },
          timestamp: new Date(pr.created_at),
        },
        { upsert: true, new: true }
      );
      syncedSummary.pullRequests++;
    }
  } catch (err) {
    console.warn('[GitHub Sync] Error fetching PRs:', err.message);
  }

  // 3. Fetch Issues
  try {
    const issuesRes = await gitHubClient.get(`/repos/${owner}/${repo}/issues?state=all&per_page=30`, {
      headers,
    });
    for (const issue of issuesRes.data || []) {
      if (issue.pull_request) continue; // Skip pull requests returned in issues API
      const authorLogin = issue.user?.login || 'unknown';
      const fairforgeUser = mappingMap.get(authorLogin.toLowerCase()) || null;

      await GitHubActivity.findOneAndUpdate(
        { project: project._id, shaOrId: `issue-${issue.id}` },
        {
          project: project._id,
          type: 'issue',
          githubAuthor: authorLogin,
          fairforgeUser,
          title: issue.title.substring(0, 150),
          description: issue.body || '',
          url: issue.html_url,
          shaOrId: `issue-${issue.id}`,
          metadata: {
            state: issue.state,
            number: issue.number,
          },
          timestamp: new Date(issue.created_at),
        },
        { upsert: true, new: true }
      );
      syncedSummary.issues++;
    }
  } catch (err) {
    console.warn('[GitHub Sync] Error fetching issues:', err.message);
  }

  // Update lastSyncedAt on project
  project.githubRepo.lastSyncedAt = new Date();
  project.githubRepo.isConnected = true;
  await project.save();

  return syncedSummary;
};

module.exports = {
  fetchRepoDetails,
  fetchContributors,
  syncProjectGitHub,
};
