import React, { useState, useEffect, useCallback } from 'react';
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
  Info,
  CheckCheck,
  Settings,
  Flame,
  Kanban,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  Legend 
} from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import InviteMemberModal from '../components/InviteMemberModal';
import TaskModal from '../components/TaskModal';
import FairForgeBackground from '../components/effects/FairForgeBackground';

const CHART_COLORS = ['#818cf8', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#a855f7'];

const ProjectDashboardPage = () => {
  const { id: paramId, projectId } = useParams();
  const activeProjectId = paramId || projectId;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Fetch complete project dashboard dataset
  const fetchDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      setError('');

      const res = await api.get(`/projects/${activeProjectId}/dashboard`);
      if (res.data.success && res.data.data) {
        setDashboardData(res.data.data);
      } else {
        setError('Failed to load project intelligence metrics');
      }
    } catch (err) {
      console.error('Project dashboard error:', err);
      setError(err.response?.data?.message || 'Server error loading project intelligence dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeProjectId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle accepting redistribution recommendation
  const handleAcceptRecommendation = async (recId) => {
    try {
      const res = await api.post(`/recommendations/${recId}/accept`);
      if (res.data.success) {
        setActionSuccess('Task redistribution applied successfully');
        setTimeout(() => setActionSuccess(''), 4000);
        fetchDashboardData(true);
      }
    } catch (err) {
      console.error('Accept recommendation error:', err);
      alert(err.response?.data?.message || 'Failed to accept recommendation');
    }
  };

  // Handle rejecting/dismissing recommendation
  const handleRejectRecommendation = async (recId) => {
    try {
      const res = await api.post(`/recommendations/${recId}/reject`);
      if (res.data.success) {
        setActionSuccess('Recommendation dismissed');
        setTimeout(() => setActionSuccess(''), 3000);
        fetchDashboardData(true);
      }
    } catch (err) {
      console.error('Reject recommendation error:', err);
      alert(err.response?.data?.message || 'Failed to dismiss recommendation');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner message="Analyzing project intelligence & team workload..." />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Unable to Load Project Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {error || 'Project data could not be retrieved. Please check your authorization or connection.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/dashboard" className="btn btn-secondary">
              <ArrowLeft size={16} /> Back to Projects
            </Link>
            <button onClick={() => fetchDashboardData()} className="btn btn-primary">
              <RotateCw size={16} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    project,
    metrics,
    progress,
    workload,
    workloadHealth,
    contributionActivity,
    attentionItems,
    recommendations,
    team,
    github,
    recentActivity
  } = dashboardData;

  const isOwnerOrManager = project.currentUserRole === 'owner' || project.currentUserRole === 'manager' || project.currentUserRole === 'lead';

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* ThreeUI Ambient Fire Background Layer */}
      <FairForgeBackground />

      <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '1.75rem' }}>
        {/* Breadcrumb & Navigation */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: '1rem', 
            marginBottom: '1.25rem' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ArrowLeft size={16} /> Projects
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <span style={{ color: '#c7d2fe', fontWeight: 600 }}>{project.name}</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <span style={{ color: 'var(--text-muted)' }}>Intelligence Dashboard</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => fetchDashboardData(true)} 
              className="btn btn-secondary" 
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
              title="Refresh intelligence metrics"
            >
              <RotateCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link 
              to={`/project/${project._id}`} 
              className="btn btn-secondary" 
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
            >
              <Kanban size={14} /> Task Board
            </Link>
            {isOwnerOrManager && (
              <button 
                onClick={() => setIsInviteModalOpen(true)} 
                className="btn btn-secondary" 
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
              >
                <UserPlus size={14} /> Invite Member
              </button>
            )}
            <button 
              onClick={() => setIsTaskModalOpen(true)} 
              className="btn btn-primary" 
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              <Plus size={16} /> New Task
            </button>
          </div>
        </div>

        {/* Action success alert */}
        {actionSuccess && (
          <div 
            style={{ 
              padding: '0.75rem 1.25rem', 
              background: 'rgba(16, 185, 129, 0.15)', 
              border: '1px solid rgba(16, 185, 129, 0.3)', 
              borderRadius: 'var(--radius-md)', 
              color: '#34d399', 
              fontSize: '0.9rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '1.5rem' 
            }}
          >
            <CheckCheck size={18} /> {actionSuccess}
          </div>
        )}

        {/* 1. PROJECT HEADER HERO */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '1.75rem 2rem', 
            marginBottom: '1.75rem', 
            background: 'linear-gradient(135deg, rgba(20, 27, 65, 0.75) 0%, rgba(13, 17, 38, 0.92) 100%)' 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ maxWidth: '780px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <span className={`badge badge-${project.status || 'active'}`}>
                  ● {(project.status || 'active').toUpperCase()}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Users size={14} /> {metrics.teamMembers} Members
                </span>
                {github.connected ? (
                  <span style={{ fontSize: '0.85rem', color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(56, 189, 248, 0.1)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                    <GitBranch size={13} /> {github.repoName}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <GitBranch size={13} /> GitHub Not Connected
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                {project.name}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                {project.description || 'Intelligent team workload & contribution workspace.'}
              </p>

              {/* Tech Stack & Tags */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(project.techStack || []).map((tech, idx) => (
                  <span key={idx} style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', color: '#c7d2fe', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    {tech}
                  </span>
                ))}
                {(project.tags || []).map((tag, idx) => (
                  <span key={idx} style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Health summary pill */}
            <div 
              style={{ 
                padding: '1rem 1.25rem', 
                borderRadius: 'var(--radius-md)', 
                background: workloadHealth.state === 'Balanced' ? 'rgba(16, 185, 129, 0.1)' : workloadHealth.state === 'Moderate Imbalance' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${workloadHealth.state === 'Balanced' ? 'rgba(16, 185, 129, 0.3)' : workloadHealth.state === 'Moderate Imbalance' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                minWidth: '220px'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                Workload Health
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: workloadHealth.state === 'Balanced' ? '#34d399' : workloadHealth.state === 'Moderate Imbalance' ? '#fbbf24' : '#f87171', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={18} /> {workloadHealth.state}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {metrics.activeTasks} active tasks · {progress.percentage}% completed
              </div>
            </div>
          </div>
        </div>

        {/* 2. TOP PROJECT HEALTH METRICS GRID */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', 
            gap: '1rem', 
            marginBottom: '1.75rem' 
          }}
        >
          {/* Active Tasks */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#818cf8', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Tasks</span>
              <Clock size={18} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{metrics.activeTasks}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {progress.inProgressTasks} in progress · {progress.todoTasks} todo
            </div>
          </div>

          {/* Completed */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#34d399', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</span>
              <CheckCircle2 size={18} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{metrics.completedTasks}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {progress.percentage}% completion rate
            </div>
          </div>

          {/* Overdue */}
          <div className="glass-card" style={{ padding: '1.25rem', borderColor: metrics.overdueTasks > 0 ? 'rgba(239, 68, 68, 0.4)' : 'var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: metrics.overdueTasks > 0 ? '#f87171' : 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overdue</span>
              <AlertTriangle size={18} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: metrics.overdueTasks > 0 ? '#f87171' : 'inherit' }}>
              {metrics.overdueTasks}
            </div>
            <div style={{ fontSize: '0.78rem', color: metrics.overdueTasks > 0 ? '#fca5a5' : 'var(--text-muted)', marginTop: '0.25rem' }}>
              {metrics.overdueTasks > 0 ? 'Requires immediate action' : 'All tasks on schedule'}
            </div>
          </div>

          {/* Team Members */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#38bdf8', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Team</span>
              <Users size={18} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{metrics.teamMembers}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Active contributors
            </div>
          </div>

          {/* Workload Health */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: workloadHealth.state === 'Balanced' ? '#34d399' : '#fbbf24', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Workload</span>
              <Zap size={18} />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: workloadHealth.state === 'Balanced' ? '#34d399' : workloadHealth.state === 'Moderate Imbalance' ? '#fbbf24' : '#f87171' }}>
              {workloadHealth.state}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {workload.isBalanced ? 'Equitably distributed' : `${workloadHealth.overloadedCount} overloaded`}
            </div>
          </div>

          {/* Deadline */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#f472b6', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deadline</span>
              <Calendar size={18} />
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {metrics.deadline.daysRemaining !== null ? (
                metrics.deadline.daysRemaining < 0 ? (
                  <span style={{ color: '#f87171' }}>Overdue</span>
                ) : (
                  `${metrics.deadline.daysRemaining} days`
                )
              ) : (
                'No date'
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {metrics.deadline.statusText}
            </div>
          </div>
        </div>

        {/* 3. WORKLOAD DISTRIBUTION & PROJECT PROGRESS (TWO-COLUMN GRID) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
          {/* Workload Distribution Card */}
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={18} color="#818cf8" /> Workload Distribution
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Estimated workload based on active tasks, effort, priority & deadlines.
                </p>
              </div>
              <span 
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: 'var(--radius-full)', 
                  fontWeight: 600,
                  background: workloadHealth.state === 'Balanced' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: workloadHealth.state === 'Balanced' ? '#34d399' : '#fbbf24',
                }}
              >
                {workloadHealth.state}
              </span>
            </div>

            {/* Member Workload Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem', flex: 1 }}>
              {(workload.members || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No active workload data recorded for this project yet.
                </div>
              ) : (
                workload.members.map((member) => {
                  const barColor = member.status === 'overloaded' ? '#f43f5e' : member.status === 'high' ? '#f59e0b' : member.status === 'available' ? '#06b6d4' : '#6366f1';
                  return (
                    <div key={member.user._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600 }}>{member.user.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ({member.activeTasksCount} active task{member.activeTasksCount === 1 ? '' : 's'})
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: barColor, textTransform: 'capitalize', fontWeight: 600 }}>
                            {member.status}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{member.workloadPercentage}%</span>
                        </div>
                      </div>
                      {/* Workload Progress Bar */}
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${Math.max(4, member.workloadPercentage)}%`, 
                            height: '100%', 
                            background: `linear-gradient(90deg, ${barColor} 0%, #ec4899 100%)`, 
                            borderRadius: '999px',
                            transition: 'width 0.6s ease'
                          }} 
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              💡 <em>{workloadHealth.explanation}</em>
            </div>
          </div>

          {/* Project Progress Card */}
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="#34d399" /> Project Progress
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Total task lifecycle and completion trajectory.
              </p>
            </div>

            {/* Large Progress Bar & Stats */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
                  {progress.percentage}%
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <strong style={{ color: '#34d399' }}>{progress.completedTasks}</strong> / {progress.totalTasks} tasks completed
                </span>
              </div>
              <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${progress.percentage}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)', 
                    borderRadius: '999px',
                    transition: 'width 0.8s ease'
                  }} 
                />
              </div>
            </div>

            {/* Task Status Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: 'auto' }}>
              <Link 
                to={`/project/${project._id}?status=completed`}
                style={{ textDecoration: 'none', padding: '0.85rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)' }}
              >
                <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>COMPLETED</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>{progress.completedTasks}</div>
              </Link>

              <Link 
                to={`/project/${project._id}?status=in-progress`}
                style={{ textDecoration: 'none', padding: '0.85rem', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 'var(--radius-md)' }}
              >
                <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>IN PROGRESS</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>{progress.inProgressTasks}</div>
              </Link>

              <Link 
                to={`/project/${project._id}?status=todo`}
                style={{ textDecoration: 'none', padding: '0.85rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)' }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TO DO / BACKLOG</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>{progress.todoTasks + progress.backlogTasks}</div>
              </Link>

              <Link 
                to={`/project/${project._id}?status=overdue`}
                style={{ textDecoration: 'none', padding: '0.85rem', background: progress.overdueTasks > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.03)', border: `1px solid ${progress.overdueTasks > 0 ? 'rgba(239, 68, 68, 0.3)' : 'var(--glass-border)'}`, borderRadius: 'var(--radius-md)' }}
              >
                <div style={{ fontSize: '0.75rem', color: progress.overdueTasks > 0 ? '#f87171' : 'var(--text-muted)', fontWeight: 600 }}>OVERDUE</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: progress.overdueTasks > 0 ? '#f87171' : '#ffffff', marginTop: '0.2rem' }}>{progress.overdueTasks}</div>
              </Link>
            </div>
          </div>
        </div>

        {/* 4. CONTRIBUTION ACTIVITY & NEEDS ATTENTION (TWO-COLUMN GRID) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
          {/* Contribution Activity Index Card */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart3 size={18} color="#06b6d4" /> Contribution Activity Index
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Transparent Index</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.4 }}>
                {contributionActivity.explanation}
              </p>
            </div>

            {/* Activity Chart */}
            {(contributionActivity.members || []).length > 0 ? (
              <div style={{ height: '220px', width: '100%', marginBottom: '1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contributionActivity.members} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="user.name" stroke="#6b7280" fontSize={11} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.8rem' }}
                      formatter={(val) => [`${val} Activity Index`, 'Index']}
                    />
                    <Bar dataKey="activityIndex" radius={[4, 4, 0, 0]}>
                      {contributionActivity.members.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Contribution activity will appear as the team creates and completes tasks.
              </div>
            )}

            {/* Member Summary List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(contributionActivity.members || []).slice(0, 4).map((member, idx) => (
                <div key={member.user._id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 500 }}>{member.user.name}</span>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <span>{member.tasksCompleted} tasks done</span>
                    {contributionActivity.hasGitHub && <span>{member.commitsCount} commits</span>}
                    <strong style={{ color: '#818cf8' }}>{member.activityIndex} pts</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Needs Attention Card */}
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} color="#f43f5e" /> Needs Attention
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Automated project bottleneck and risk detection.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
              {(attentionItems || []).length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)', color: '#34d399' }}>
                  <CheckCheck size={32} style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>No critical issues detected</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Project currently has no major workload, deadline, or overdue warnings.
                  </div>
                </div>
              ) : (
                attentionItems.map((item) => {
                  const borderCol = item.severity === 'danger' ? 'rgba(239, 68, 68, 0.3)' : item.severity === 'warning' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(56, 189, 248, 0.3)';
                  const bgCol = item.severity === 'danger' ? 'rgba(239, 68, 68, 0.08)' : item.severity === 'warning' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(56, 189, 248, 0.08)';
                  const titleCol = item.severity === 'danger' ? '#f87171' : item.severity === 'warning' ? '#fbbf24' : '#38bdf8';

                  return (
                    <div 
                      key={item.id} 
                      style={{ 
                        padding: '1rem 1.2rem', 
                        background: bgCol, 
                        border: `1px solid ${borderCol}`, 
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <div style={{ fontWeight: 700, color: titleCol, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                          <AlertTriangle size={15} /> {item.title}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {item.description}
                        </div>
                      </div>
                      {item.actionText && (
                        <Link 
                          to={`/project/${project._id}${item.filterStatus ? `?status=${item.filterStatus}` : ''}`}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                        >
                          {item.actionText}
                        </Link>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 5. FAIRFORGE TASK REDISTRIBUTION RECOMMENDATIONS */}
        <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="#ec4899" /> FairForge Task Redistribution Recommendations
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Explainable rule-based balancing suggestions based on capacity, skill match, and deadlines.
              </p>
            </div>
            <span style={{ fontSize: '0.8rem', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
              {recommendations.length} Suggestion{recommendations.length === 1 ? '' : 's'} Available
            </span>
          </div>

          {(recommendations || []).length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
              <CheckCheck size={36} color="#34d399" style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>No task redistribution needed right now</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Workload across team members is currently well-balanced and no team members are overburdened.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {recommendations.map((rec) => (
                <div 
                  key={rec._id} 
                  className="glass-card" 
                  style={{ 
                    padding: '1.5rem', 
                    border: '1px solid rgba(236, 72, 153, 0.25)', 
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(13, 17, 38, 0.9) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f472b6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Suggested Reassignment
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                        {rec.confidenceScore || 85}% Confidence
                      </span>
                    </div>

                    {/* Task Title */}
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', color: '#ffffff' }}>
                      {rec.task?.title || 'Project Task'}
                    </h4>

                    {/* Member Transfer Visualization */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', marginBottom: '0.85rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>From</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f87171' }}>{rec.fromMember?.name || 'Member'}</div>
                      </div>
                      <ChevronRight size={18} color="var(--text-muted)" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>To</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399' }}>{rec.toMember?.name || 'Available Member'}</div>
                      </div>
                    </div>

                    {/* Reason & Impact */}
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                      <p style={{ marginBottom: '0.35rem' }}><strong>Why:</strong> {rec.reason}</p>
                      {rec.impact && <p><strong>Impact:</strong> {rec.impact}</p>}
                    </div>
                  </div>

                  {/* Actions */}
                  {isOwnerOrManager && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <button 
                        onClick={() => handleAcceptRecommendation(rec._id)}
                        className="btn btn-primary" 
                        style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }}
                      >
                        <Check size={14} /> Accept & Reassign
                      </button>
                      <button 
                        onClick={() => handleRejectRecommendation(rec._id)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
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

        {/* 6. TEAM MEMBERS & GITHUB ACTIVITY (TWO-COLUMN GRID) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
          {/* Team Members List */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={18} color="#818cf8" /> Team Members ({team.length})
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Workload state & active task commitments.
                </p>
              </div>
              {isOwnerOrManager && (
                <button onClick={() => setIsInviteModalOpen(true)} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                  <UserPlus size={14} /> Invite
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {team.map((member, idx) => (
                <div 
                  key={member.user._id || idx}
                  style={{ 
                    padding: '0.75rem 1rem', 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid var(--glass-border)', 
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div 
                      style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 700, 
                        fontSize: '0.9rem',
                        color: '#ffffff'
                      }}
                    >
                      {member.user.name ? member.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {member.user.name}
                        {member.role === 'owner' && (
                          <span style={{ fontSize: '0.65rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                            OWNER
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {(member.skills || []).slice(0, 3).join(' · ') || 'Full Stack'}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      {member.activeTasksCount} active task{member.activeTasksCount === 1 ? '' : 's'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: member.workloadStatus === 'overloaded' ? '#f87171' : member.workloadStatus === 'high' ? '#fbbf24' : '#34d399', textTransform: 'capitalize' }}>
                      {member.workloadStatus}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GitHub Activity */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GitBranch size={18} color="#38bdf8" /> GitHub Repository
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Live repository commits, PRs & collaboration metrics.
                </p>
              </div>
              {github.connected && (
                <Link to={`/project/${project._id}?tab=github`} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                  Manage Sync
                </Link>
              )}
            </div>

            {github.connected ? (
              <div>
                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>COMMITS</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>{github.stats.commits}</div>
                  </div>
                  <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PRS</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#818cf8', marginTop: '0.2rem' }}>{github.stats.pullRequests}</div>
                  </div>
                  <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>REVIEWS</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>{github.stats.reviews}</div>
                  </div>
                  <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ISSUES</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>{github.stats.issues}</div>
                  </div>
                </div>

                {/* Recent commits / PRs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(github.recentActivity || []).length === 0 ? (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                      No recent commits fetched yet.
                    </div>
                  ) : (
                    github.recentActivity.map((item, idx) => (
                      <div key={item._id || idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', padding: '0.4rem 0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                        {item.type === 'commit' ? <GitCommit size={14} color="#38bdf8" /> : <GitPullRequest size={14} color="#818cf8" />}
                        <span style={{ fontWeight: 600, color: '#c7d2fe' }}>{item.githubAuthor}:</span>
                        <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {item.title}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                <GitBranch size={32} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>GitHub Not Connected</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Connect your repository to sync commits, pull requests, and calculate accurate contribution indices.
                </p>
                {isOwnerOrManager && (
                  <Link to={`/project/${project._id}?tab=github`} className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                    Connect GitHub Repository
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 7. RECENT PROJECT ACTIVITY TIMELINE */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ActivityIcon size={18} color="#f59e0b" /> Recent Project Activity
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Audit trail of task assignments, completions, and team milestones.
            </p>
          </div>

          {(recentActivity || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No recent project activity logged yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentActivity.map((act, idx) => (
                <div 
                  key={act._id || idx}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.9rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818cf8' }} />
                    <span style={{ color: '#ffffff' }}>{act.description}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {act.timestamp ? new Date(act.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <InviteMemberModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        projectId={project._id}
        projectName={project.name}
        onMemberInvited={() => fetchDashboardData(true)}
      />

      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projectId={project._id}
        projectMembers={team.map((t) => t.user)}
        onTaskCreated={() => fetchDashboardData(true)}
      />
    </div>
  );
};

export default ProjectDashboardPage;
