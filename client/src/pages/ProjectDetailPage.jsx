import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Tag, 
  Plus, 
  Sparkles, 
  GitBranch, 
  Shield, 
  Layers,
  BarChart3,
  AlertCircle,
  AlertTriangle,
  RotateCw,
  FolderGit2,
  Trash2,
  Edit3,
  Filter,
  Search,
  MessageSquare,
  UserPlus,
  GitCommit,
  GitPullRequest,
  Check,
  Zap,
  TrendingUp,
  Activity as ActivityIcon,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import InviteMemberModal from '../components/InviteMemberModal';

const COLORS = ['#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#a855f7'];

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active Tab: 'overview' | 'tasks' | 'team' | 'github' | 'analytics' | 'workload' | 'activity'
  const [activeTab, setActiveTab] = useState('overview');

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [workloadData, setWorkloadData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [githubData, setGithubData] = useState({ activities: [], contributors: [] });
  const [activities, setActivities] = useState([]);

  // Modals & Forms
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // GitHub Form
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [githubSyncing, setGithubSyncing] = useState(false);

  // Task Filter & View
  const [taskView, setTaskView] = useState('kanban'); // 'kanban' | 'list'
  const [taskSearch, setTaskSearch] = useState('');
  const [taskFilterStatus, setTaskFilterStatus] = useState('all');
  const [taskFilterPriority, setTaskFilterPriority] = useState('all');
  const [taskFilterMember, setTaskFilterMember] = useState('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch Project & Initial Data
  const fetchProject = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.project);
        if (res.data.project.githubRepo?.isConnected) {
          setGithubRepoUrl(`${res.data.project.githubRepo.owner}/${res.data.project.githubRepo.repo}`);
        }
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err.response?.data?.message || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks/project/${id}`);
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.warn('Error fetching tasks:', err);
    }
  };

  const fetchDashboardMetrics = async () => {
    try {
      const res = await api.get(`/projects/${id}/dashboard`);
      if (res.data.success) {
        setDashboardMetrics(res.data.metrics);
      }
    } catch (err) {
      console.warn('Error fetching metrics:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [analyticsRes, workloadRes, recsRes] = await Promise.all([
        api.get(`/analytics/project/${id}`),
        api.get(`/analytics/workload/${id}`),
        api.get(`/recommendations/project/${id}`),
      ]);
      if (analyticsRes.data.success) setAnalyticsData(analyticsRes.data.analytics);
      if (workloadRes.data.success) setWorkloadData(workloadRes.data.workloadAnalysis);
      if (recsRes.data.success) setRecommendations(recsRes.data.recommendations);
    } catch (err) {
      console.warn('Error loading analytics:', err);
    }
  };

  const fetchGitHubData = async () => {
    try {
      const res = await api.get(`/github/activity/${id}`);
      if (res.data.success) {
        setGithubData({
          activities: res.data.activities || [],
          contributors: res.data.contributors || [],
        });
      }
    } catch (err) {
      console.warn('Error loading github data:', err);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await api.get(`/activity/project/${id}`);
      if (res.data.success) {
        setActivities(res.data.activities);
      }
    } catch (err) {
      console.warn('Error loading activities:', err);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  // Load relevant tab data on change
  useEffect(() => {
    if (!project) return;
    if (activeTab === 'overview') {
      fetchDashboardMetrics();
      fetchTasks();
    } else if (activeTab === 'tasks') {
      fetchTasks();
    } else if (activeTab === 'analytics' || activeTab === 'workload') {
      fetchAnalytics();
    } else if (activeTab === 'github') {
      fetchGitHubData();
    } else if (activeTab === 'activity') {
      fetchActivities();
    }
  }, [activeTab, project]);

  // GitHub Connect Handler
  const handleConnectGitHub = async (e) => {
    e.preventDefault();
    if (!githubRepoUrl.trim()) return;
    try {
      setGithubSyncing(true);
      const res = await api.post(`/github/connect/${id}`, { repoUrl: githubRepoUrl.trim() });
      if (res.data.success) {
        alert(res.data.message);
        fetchProject();
        fetchGitHubData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to connect GitHub repository');
    } finally {
      setGithubSyncing(false);
    }
  };

  // GitHub Manual Sync Handler
  const handleSyncGitHub = async () => {
    try {
      setGithubSyncing(true);
      const res = await api.post(`/github/sync/${id}`);
      if (res.data.success) {
        alert(res.data.message);
        fetchGitHubData();
        fetchAnalytics();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to sync GitHub activity');
    } finally {
      setGithubSyncing(false);
    }
  };

  // Recommendation Actions
  const handleAcceptRecommendation = async (recId) => {
    try {
      const res = await api.post(`/recommendations/${recId}/accept`);
      if (res.data.success) {
        alert('Recommendation accepted! Task assignment has been updated.');
        fetchAnalytics();
        fetchTasks();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept recommendation');
    }
  };

  const handleDismissRecommendation = async (recId) => {
    try {
      await api.post(`/recommendations/${recId}/dismiss`);
      fetchAnalytics();
    } catch (err) {
      alert('Failed to dismiss recommendation');
    }
  };

  // Task Status Shift
  const handleStatusShift = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      if (res.data.success) {
        setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data.task : t)));
      }
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  // Role Update
  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/projects/${id}/members/${userId}/role`, { role: newRole });
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update member role');
    }
  };

  // Remove Member
  const handleRemoveMember = async (userId, memberName) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from the project?`)) {
      try {
        await api.delete(`/projects/${id}/members/${userId}`);
        fetchProject();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to remove member');
      }
    }
  };

  // Task Filtering
  const filteredTasks = tasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(taskSearch.toLowerCase())) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(taskSearch.toLowerCase())));

    const matchStatus = taskFilterStatus === 'all' || t.status === taskFilterStatus;
    const matchPriority = taskFilterPriority === 'all' || t.priority === taskFilterPriority;
    const matchMember =
      taskFilterMember === 'all' ||
      (taskFilterMember === 'unassigned' && !t.assignedTo) ||
      (t.assignedTo && (t.assignedTo._id === taskFilterMember || t.assignedTo === taskFilterMember));

    return matchSearch && matchStatus && matchPriority && matchMember;
  });

  const allProjectMembers = project
    ? [
        project.owner,
        ...(project.members || []).map((m) => m.user),
      ].filter(Boolean)
    : [];

  const isOwnerOrManager =
    project?.currentUserRole === 'owner' ||
    project?.currentUserRole === 'manager' ||
    project?.currentUserRole === 'lead';

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '5rem' }}>
        <LoadingSpinner message="Loading workspace..." size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={40} color="#fb7185" style={{ marginBottom: '1rem' }} />
          <h2>Project Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <Link to="/dashboard" className="btn btn-primary">
            <ArrowLeft size={16} /> Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      {/* Back to Projects */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={15} /> Back to Projects
        </Link>
      </div>

      {/* Project Banner Header */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(20, 27, 65, 0.8) 0%, rgba(13, 17, 38, 0.95) 100%)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span className={`badge badge-${project.status}`}>{project.status}</span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', color: '#c7d2fe', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 600 }}>
              Role: {project.currentUserRole}
            </span>
            {project.techStack?.map((tech, idx) => (
              <span key={idx} style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                {tech}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {project.githubRepo?.isConnected && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                <GitBranch size={13} /> Connected to GitHub
              </span>
            )}
            {project.deadline && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                <Calendar size={13} /> Due: {new Date(project.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', marginBottom: '0.6rem' }}>
          {project.name}
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '850px' }}>
          {project.description || 'No description provided for this team workspace.'}
        </p>
      </div>

      {/* Navigation Tabs Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.35rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '2rem',
        }}
      >
        {[
          { id: 'overview', label: 'Dashboard', icon: <Layers size={16} /> },
          { id: 'tasks', label: 'Tasks & Kanban', icon: <CheckCircle2 size={16} /> },
          { id: 'team', label: 'Team Members', icon: <Users size={16} /> },
          { id: 'github', label: 'GitHub Repository', icon: <GitBranch size={16} /> },
          { id: 'analytics', label: 'Contribution Analytics', icon: <BarChart3 size={16} /> },
          { id: 'workload', label: 'Workload & Rebalance', icon: <Zap size={16} /> },
          { id: 'activity', label: 'Activity History', icon: <ActivityIcon size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.7rem 1.15rem',
              background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
              color: activeTab === tab.id ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              borderRadius: '6px 6px 0 0',
              transition: 'all var(--transition-fast)',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW / DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div>
          {/* Summary Stat Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Project Progress</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#6366f1' }}>
                {dashboardMetrics?.progress || 0}%
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                <div style={{ width: `${dashboardMetrics?.progress || 0}%`, height: '100%', background: 'var(--accent-gradient)' }} />
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Total Tasks</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
                {dashboardMetrics?.totalTasks || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.3rem' }}>
                {dashboardMetrics?.completedTasks || 0} completed
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>In Progress</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>
                {dashboardMetrics?.inProgressTasks || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.3rem' }}>
                {dashboardMetrics?.todoTasks || 0} in queue
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Overdue Tasks</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: dashboardMetrics?.overdueTasks > 0 ? '#fb7185' : '#10b981' }}>
                {dashboardMetrics?.overdueTasks || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.3rem' }}>
                {dashboardMetrics?.overdueTasks > 0 ? 'Action needed' : 'On schedule'}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Team Size</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a855f7' }}>
                {dashboardMetrics?.memberCount || 1}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.3rem' }}>
                Collaborators
              </div>
            </div>
          </div>

          {/* Grid: Deadlines & Live Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Upcoming Deadlines */}
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={18} color="#f59e0b" /> Upcoming Deadlines
              </h3>

              {!dashboardMetrics?.upcomingDeadlines || dashboardMetrics.upcomingDeadlines.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No upcoming deadlines in the next 7 days.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {dashboardMetrics.upcomingDeadlines.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => { setSelectedTaskId(t._id); setIsTaskDetailOpen(true); }}
                      style={{
                        padding: '0.85rem 1rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff', marginBottom: '2px' }}>{t.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Assignee: {t.assignedTo?.name || 'Unassigned'}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, background: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Live Activity */}
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ActivityIcon size={18} color="#34d399" /> Recent Team Activity
              </h3>

              {!dashboardMetrics?.recentActivity || dashboardMetrics.recentActivity.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No activity recorded yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {dashboardMetrics.recentActivity.slice(0, 6).map((act) => (
                    <div
                      key={act._id}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', color: '#ffffff', marginBottom: '2px' }}>{act.description}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                        {new Date(act.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TASKS & KANBAN BOARD */}
      {/* ========================================================================= */}
      {activeTab === 'tasks' && (
        <div>
          {/* Controls Bar: Search, Filters, View Switch, Add Task */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}
          >
            {/* Search and Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '300px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search tasks..."
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              </div>

              <select
                className="form-control"
                style={{ width: 'auto', minWidth: '130px' }}
                value={taskFilterPriority}
                onChange={(e) => setTaskFilterPriority(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                className="form-control"
                style={{ width: 'auto', minWidth: '140px' }}
                value={taskFilterMember}
                onChange={(e) => setTaskFilterMember(e.target.value)}
              >
                <option value="all">All Assignees</option>
                <option value="unassigned">Unassigned</option>
                {allProjectMembers.map((m) => {
                  const u = m.user || m;
                  return (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Actions: View Switch + Add Task */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                <button
                  onClick={() => setTaskView('kanban')}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: taskView === 'kanban' ? 'var(--accent-gradient)' : 'transparent',
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Kanban
                </button>
                <button
                  onClick={() => setTaskView('list')}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: taskView === 'list' ? 'var(--accent-gradient)' : 'transparent',
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  List
                </button>
              </div>

              <button
                onClick={() => { setTaskToEdit(null); setIsTaskModalOpen(true); }}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.25rem' }}
              >
                <Plus size={16} /> Add Task
              </button>
            </div>
          </div>

          {/* Kanban Board View */}
          {taskView === 'kanban' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
                alignItems: 'start',
              }}
            >
              {[
                { id: 'backlog', label: 'Backlog', color: '#94a3b8' },
                { id: 'todo', label: 'To Do', color: '#6366f1' },
                { id: 'in-progress', label: 'In Progress', color: '#38bdf8' },
                { id: 'review', label: 'In Review', color: '#f59e0b' },
                { id: 'completed', label: 'Completed', color: '#10b981' },
              ].map((col) => {
                const colTasks = filteredTasks.filter((t) => t.status === col.id);
                return (
                  <div
                    key={col.id}
                    className="glass-panel"
                    style={{
                      padding: '1.25rem',
                      background: 'rgba(13, 17, 38, 0.6)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      minHeight: '450px',
                    }}
                  >
                    {/* Column Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: `2px solid ${col.color}` }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>{col.label}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600 }}>
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Task Cards in Column */}
                    {colTasks.map((t) => (
                      <div
                        key={t._id}
                        className="glass-card"
                        onClick={() => { setSelectedTaskId(t._id); setIsTaskDetailOpen(true); }}
                        style={{
                          padding: '1rem',
                          background: 'rgba(20, 27, 65, 0.7)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.6rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span className={`badge badge-${t.priority === 'critical' ? 'danger' : t.priority === 'high' ? 'planning' : 'active'}`} style={{ fontSize: '0.65rem' }}>
                            {t.priority}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                            {t.difficulty} ({t.difficultyWeight || 2} pts)
                          </span>
                        </div>

                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.4 }}>
                          {t.title}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.4rem', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                              {t.assignedTo?.name ? t.assignedTo.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {t.assignedTo?.name || 'Unassigned'}
                            </span>
                          </div>

                          {t.dueDate && (
                            <span style={{ color: new Date(t.dueDate) < new Date() && t.status !== 'completed' ? '#fb7185' : 'inherit' }}>
                              {new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredTasks.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => { setSelectedTaskId(t._id); setIsTaskDetailOpen(true); }}
                    style={{
                      padding: '1rem 1.25rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
                      <span className={`badge badge-${t.status}`}>{t.status}</span>
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{t.title}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Priority: <strong style={{ color: '#fff' }}>{t.priority}</strong></span>
                      <span style={{ color: 'var(--text-muted)' }}>Assignee: <strong style={{ color: '#fff' }}>{t.assignedTo?.name || 'Unassigned'}</strong></span>
                      {t.dueDate && (
                        <span style={{ color: new Date(t.dueDate) < new Date() && t.status !== 'completed' ? '#fb7185' : 'var(--text-subtle)' }}>
                          {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TEAM MEMBERS */}
      {/* ========================================================================= */}
      {activeTab === 'team' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>Team Collaborators & Roles</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Manage team access, assignments, and contributor roles
              </p>
            </div>

            {isOwnerOrManager && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.25rem' }}
              >
                <UserPlus size={16} /> Add Team Member
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Project Owner */}
            {project.owner && (
              <div
                style={{
                  padding: '1.15rem 1.5rem',
                  background: 'rgba(99, 102, 241, 0.06)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem' }}>
                    {project.owner.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>{project.owner.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{project.owner.email}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {project.owner.skills?.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      {project.owner.skills.slice(0, 3).map((s, idx) => (
                        <span key={idx} style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: '#c7d2fe' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <span style={{ fontSize: '0.8rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                    Project Owner
                  </span>
                </div>
              </div>
            )}

            {/* Other Members */}
            {project.members?.map((m, idx) => {
              const u = m.user;
              if (!u || u._id === project.owner?._id) return null;
              return (
                <div
                  key={idx}
                  style={{
                    padding: '1.15rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem' }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>{u.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {u.skills?.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {u.skills.slice(0, 3).map((s, sIdx) => (
                          <span key={sIdx} style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: '#c7d2fe' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {isOwnerOrManager ? (
                      <select
                        value={m.role || 'member'}
                        onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                        style={{
                          background: 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          color: '#c7d2fe',
                          padding: '0.3rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <option value="manager">Manager</option>
                        <option value="lead">Lead</option>
                        <option value="developer">Developer</option>
                        <option value="designer">Designer</option>
                        <option value="member">Member</option>
                      </select>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#818cf8', background: 'rgba(99, 102, 241, 0.1)', padding: '0.25rem 0.65rem', borderRadius: '4px', fontWeight: 600, textTransform: 'capitalize' }}>
                        {m.role || 'Member'}
                      </span>
                    )}

                    {isOwnerOrManager && (
                      <button
                        onClick={() => handleRemoveMember(u._id, u.name)}
                        title="Remove member"
                        style={{
                          background: 'rgba(244, 63, 94, 0.1)',
                          border: '1px solid rgba(244, 63, 94, 0.2)',
                          color: '#fb7185',
                          borderRadius: '6px',
                          padding: '0.4rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GITHUB INTEGRATION */}
      {/* ========================================================================= */}
      {activeTab === 'github' && (
        <div>
          {/* Connection Card */}
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                  <GitBranch size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>GitHub Repository Integration</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Collect commits, pull requests, reviews, and contributor metrics
                  </p>
                </div>
              </div>

              {project.githubRepo?.isConnected && (
                <button
                  onClick={handleSyncGitHub}
                  disabled={githubSyncing}
                  className="btn btn-secondary"
                  style={{ gap: '0.4rem' }}
                >
                  <RotateCw size={15} className={githubSyncing ? 'spin' : ''} />
                  {githubSyncing ? 'Synchronizing...' : 'Sync Repository'}
                </button>
              )}
            </div>

            {project.githubRepo?.isConnected ? (
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                      {project.githubRepo.owner} / {project.githubRepo.repo}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Default Branch: <span style={{ color: '#818cf8' }}>{project.githubRepo.branch || 'main'}</span> • Last Synced: {project.githubRepo.lastSyncedAt ? new Date(project.githubRepo.lastSyncedAt).toLocaleString() : 'Never'}
                    </div>
                  </div>

                  <a
                    href={`https://github.com/${project.githubRepo.owner}/${project.githubRepo.repo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    Open on GitHub <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConnectGitHub} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter GitHub repo (e.g. 56-collab/fairforage or full GitHub URL)"
                  value={githubRepoUrl}
                  onChange={(e) => setGithubRepoUrl(e.target.value)}
                  style={{ flex: 1, minWidth: '280px' }}
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={githubSyncing}>
                  {githubSyncing ? 'Connecting...' : 'Connect Repository'}
                </button>
              </form>
            )}
          </div>

          {/* Synced Repository Activity Feed */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>
              Synced Repository Activity ({githubData.activities.length})
            </h3>

            {githubData.activities.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                {project.githubRepo?.isConnected
                  ? 'No activity synced yet. Click "Sync Repository" above to fetch commits and pull requests.'
                  : 'Connect a repository above to view commits and PR activity.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {githubData.activities.map((act) => (
                  <div
                    key={act._id}
                    style={{
                      padding: '0.85rem 1.15rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      {act.type === 'commit' ? (
                        <GitCommit size={18} color="#818cf8" />
                      ) : act.type === 'pull_request' ? (
                        <GitPullRequest size={18} color="#34d399" />
                      ) : (
                        <AlertCircle size={18} color="#f59e0b" />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{act.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Author: <strong style={{ color: '#c7d2fe' }}>{act.githubAuthor}</strong>
                          {act.fairforgeUser && (
                            <span> (Mapped to {act.fairforgeUser.name})</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      {new Date(act.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CONTRIBUTION ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div>
          {/* Transparent Notice */}
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Info size={20} color="#818cf8" />
            <div style={{ fontSize: '0.85rem', color: '#c7d2fe', lineHeight: 1.5 }}>
              <strong>Explainable Activity Index:</strong> This metric represents engagement signals (completed tasks, task difficulty weights, Git commits, and team collaboration). It is an activity indicator rather than an absolute measure of performance.
            </div>
          </div>

          {/* Member Activity Index Cards & Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {analyticsData?.members?.map((m, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: COLORS[idx % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {m.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{m.user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.user?.email}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: COLORS[idx % COLORS.length] }}>
                      {m.activityIndex}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Activity Score</div>
                  </div>
                </div>

                {/* Progress share */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span>Contribution Share</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{m.contributionSharePercentage}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${m.contributionSharePercentage}%`, height: '100%', background: COLORS[idx % COLORS.length] }} />
                  </div>
                </div>

                {/* Signal counts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div>Completed: <strong>{m.tasksCompleted} tasks</strong></div>
                  <div>Effort Points: <strong>{m.taskPoints} pts</strong></div>
                  <div>Git Commits: <strong>{m.commitsCount}</strong></div>
                  <div>Discussions: <strong>{m.commentsCount} comments</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: WORKLOAD & REDISTRIBUTION */}
      {/* ========================================================================= */}
      {activeTab === 'workload' && (
        <div>
          {/* Imbalance Alert Banner */}
          {workloadData?.alerts && workloadData.alerts.length > 0 ? (
            <div
              style={{
                padding: '1.25rem 1.5rem',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.9rem',
              }}
            >
              <AlertTriangle size={22} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '1rem', color: '#fcd34d', marginBottom: '0.25rem' }}>
                  Workload Imbalance Detected
                </h4>
                {workloadData.alerts.map((a, idx) => (
                  <p key={idx} style={{ fontSize: '0.85rem', color: '#fef3c7', lineHeight: 1.5 }}>
                    {a.message}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '1.25rem 1.5rem',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <CheckCircle2 size={22} color="#34d399" />
              <span style={{ fontSize: '0.9rem', color: '#6ee7b7' }}>
                <strong>Workload is Balanced:</strong> Active tasks and difficulty weights are well-distributed among active team members.
              </span>
            </div>
          )}

          {/* Member Workload Distribution Cards */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Active Workload by Member</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {workloadData?.memberWorkloads?.map((mw, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{mw.user?.name}</span>
                    <span className={`badge badge-${mw.status === 'overloaded' ? 'danger' : mw.status === 'available' ? 'completed' : 'active'}`}>
                      {mw.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1', marginBottom: '0.25rem' }}>
                    {mw.workloadScore} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>load pts</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                    {mw.activeTasksCount} active tasks • {mw.workloadVsAverage}% of team avg
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Redistribution Recommendations */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={20} color="#f59e0b" />
                <h3 style={{ fontSize: '1.2rem' }}>Task Redistribution Recommendations</h3>
              </div>
            </div>

            {recommendations.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No task redistribution suggestions at this time.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recommendations.map((rec) => (
                  <div
                    key={rec._id}
                    style={{
                      padding: '1.25rem 1.5rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                        Reassign "{rec.task?.title}" from {rec.fromMember?.name} &rarr; {rec.toMember?.name}
                      </div>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        Confidence: {rec.confidenceScore}%
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      <strong>Rationale:</strong> {rec.reason}
                    </p>
                    {rec.impact && (
                      <p style={{ fontSize: '0.8rem', color: '#a5b4fc' }}>
                        {rec.impact}
                      </p>
                    )}

                    {isOwnerOrManager && rec.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button
                          onClick={() => handleAcceptRecommendation(rec._id)}
                          className="btn btn-primary"
                          style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
                        >
                          <Check size={14} /> Accept & Reassign
                        </button>
                        <button
                          onClick={() => handleDismissRecommendation(rec._id)}
                          className="btn btn-secondary"
                          style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: ACTIVITY HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'activity' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ActivityIcon size={20} color="#34d399" /> Chronological Project Audit Log
          </h2>

          {activities.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No activity records found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activities.map((act) => (
                <div
                  key={act._id}
                  style={{
                    padding: '0.85rem 1.15rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '2px' }}>{act.description}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>By {act.user?.name || 'User'}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    {new Date(act.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projectId={id}
        projectMembers={allProjectMembers}
        taskToEdit={taskToEdit}
        onTaskSaved={(savedTask) => {
          fetchTasks();
          fetchDashboardMetrics();
        }}
      />

      <TaskDetailModal
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
        taskId={selectedTaskId}
        onTaskUpdated={(updated) => {
          fetchTasks();
          fetchDashboardMetrics();
        }}
        onOpenEditModal={(task) => {
          setTaskToEdit(task);
          setIsTaskModalOpen(true);
        }}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        projectId={id}
        onMemberAdded={(updatedProj) => {
          setProject(updatedProj);
        }}
      />
    </div>
  );
};

export default ProjectDetailPage;
