import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Layers, 
  Activity, 
  GitCommit, 
  GitPullRequest, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  FolderGit2
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const PersonalDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPersonalStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/analytics/my-stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Fetch my-stats error:', err);
      setError(err.response?.data?.message || 'Failed to load personal metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalStats();
  }, []);

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    const nextStatus =
      currentStatus === 'todo' || currentStatus === 'backlog'
        ? 'in-progress'
        : currentStatus === 'in-progress'
        ? 'completed'
        : 'in-progress';

    try {
      const res = await api.put(`/tasks/${taskId}/status`, { status: nextStatus });
      if (res.data.success) {
        fetchPersonalStats();
      }
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '5rem' }}>
        <LoadingSpinner message="Loading your personal workspace..." size="lg" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertTriangle size={36} color="#fb7185" style={{ marginBottom: '1rem' }} />
          <h3>Could not load personal stats</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={fetchPersonalStats} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(20, 27, 65, 0.7) 0%, rgba(13, 17, 38, 0.95) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
          <Sparkles size={14} /> Individual Workspace
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '0.4rem' }}>
          {user?.name}'s Personal Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Your active commitments, assigned tasks, and contribution analytics across all projects.
        </p>

        {/* Quick Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Active Tasks</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#818cf8' }}>{stats.activeCount}</div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Completed Tasks</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>{stats.completedCount}</div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Workload Points</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>{stats.workloadScore} pts</div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Overdue Tasks</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: stats.overdueCount > 0 ? '#fb7185' : '#ffffff' }}>
              {stats.overdueCount}
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Git Commits</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a855f7' }}>{stats.commitsCount}</div>
          </div>
        </div>
      </div>

      {/* Grid: My Tasks & Activity Feed */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Active Tasks Panel */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="#818cf8" /> My Active Tasks ({stats.activeTasks?.length || 0})
            </h2>
          </div>

          {stats.activeTasks?.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={36} color="#34d399" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600 }}>All tasks completed!</div>
              <div style={{ fontSize: '0.85rem' }}>You have no pending tasks assigned at the moment.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.activeTasks.map((t) => {
                const isOverdue = t.dueDate && new Date(t.dueDate) < new Date();
                return (
                  <div
                    key={t._id}
                    style={{
                      padding: '1rem 1.1rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <Link
                          to={`/project/${t.project?._id || t.project}`}
                          style={{
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            color: '#ffffff',
                            textDecoration: 'none',
                          }}
                        >
                          {t.title}
                        </Link>
                        <div style={{ fontSize: '0.75rem', color: '#818cf8', marginTop: '2px' }}>
                          Project: {t.project?.name || 'Workspace'}
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleTaskStatus(t._id, t.status)}
                        className={`badge badge-${t.status}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to advance status"
                      >
                        {t.status}
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-subtle)', paddingTop: '0.4rem', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <span>Priority: <strong style={{ color: '#fff' }}>{t.priority}</strong></span>
                      {t.dueDate && (
                        <span style={{ color: isOverdue ? '#fb7185' : 'var(--text-muted)' }}>
                          Due: {new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity & Recent Actions */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="#34d399" /> Recent Actions
            </h2>
          </div>

          {stats.recentActivities?.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No recent activity recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.recentActivities.map((act) => (
                <div
                  key={act._id}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ color: '#ffffff', marginBottom: '3px' }}>{act.description}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                    {new Date(act.timestamp || act.createdAt).toLocaleDateString(undefined, {
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
  );
};

export default PersonalDashboardPage;
