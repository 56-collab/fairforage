import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
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
  AlertCircle
} from 'lucide-react';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Sample task items to demonstrate task structure and status toggle
  const [sampleTasks, setSampleTasks] = useState([
    {
      id: 't-1',
      title: 'Initialize MERN Stack Foundation & Authentication',
      status: 'completed',
      assignee: 'Alex Rivera',
      priority: 'high',
      workloadWeight: 3,
    },
    {
      id: 't-2',
      title: 'Design Glassmorphism UI & Mobile-First Component Library',
      status: 'completed',
      assignee: 'Alex Rivera',
      priority: 'medium',
      workloadWeight: 2,
    },
    {
      id: 't-3',
      title: 'Implement REST API Endpoints for Task & Workload Tracking',
      status: 'in-progress',
      assignee: 'Team Member',
      priority: 'high',
      workloadWeight: 4,
    },
    {
      id: 't-4',
      title: 'Connect GitHub Webhooks for Automatic Contribution Scoring',
      status: 'todo',
      assignee: 'Unassigned',
      priority: 'medium',
      workloadWeight: 3,
    },
  ]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/projects/${id}`);
        if (res.data.success) {
          setProject(res.data.project);
        }
      } catch (err) {
        console.error('Fetch project detail error:', err);
        setError(err.response?.data?.message || 'Failed to fetch project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  const toggleTaskStatus = (taskId) => {
    setSampleTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const nextStatus =
            task.status === 'todo'
              ? 'in-progress'
              : task.status === 'in-progress'
              ? 'completed'
              : 'todo';
          return { ...task, status: nextStatus };
        }
        return task;
      })
    );
  };

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
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {error || 'The requested project could not be found or you do not have permission to view it.'}
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      {/* Project Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem 2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(20, 27, 65, 0.8) 0%, rgba(13, 17, 38, 0.95) 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className={`badge badge-${project.status || 'active'}`}>
              {project.status || 'active'}
            </span>
            {project.tags &&
              project.tags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.6rem',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '4px',
                    color: 'var(--text-muted)',
                  }}
                >
                  #{tag}
                </span>
              ))}
          </div>

          <div style={{ fontSize: '0.825rem', color: 'var(--text-subtle)' }}>
            Created: {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </div>

        <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginBottom: '0.75rem' }}>
          {project.name}
        </h1>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '1rem',
            lineHeight: 1.6,
            maxWidth: '800px',
          }}
        >
          {project.description || 'No description provided.'}
        </p>
      </div>

      {/* Grid Layout: Team Members & Workload Intelligence Preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Team Members Glass Card */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="#818cf8" />
              <h3 style={{ fontSize: '1.15rem' }}>Team Members</h3>
            </div>
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {(project.members?.length || 0) + (project.owner ? 1 : 0)} Total
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Owner */}
            {project.owner && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'var(--accent-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  >
                    {project.owner.name?.charAt(0).toUpperCase() || 'O'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                      {project.owner.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      {project.owner.email}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#f59e0b',
                    background: 'rgba(245, 158, 11, 0.1)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                  }}
                >
                  Project Owner
                </span>
              </div>
            )}

            {/* Other Members */}
            {project.members &&
              project.members.map((m, idx) => {
                const memberUser = m.user;
                if (!memberUser || (project.owner && memberUser._id === project.owner._id)) return null;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: 'rgba(99, 102, 241, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      >
                        {memberUser.name?.charAt(0).toUpperCase() || 'M'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                          {memberUser.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                          {memberUser.email}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#818cf8',
                        background: 'rgba(99, 102, 241, 0.1)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    >
                      {m.role || 'Member'}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Workload Health Card */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} color="#34d399" />
              <h3 style={{ fontSize: '1.15rem' }}>Workload Distribution</h3>
            </div>
            <span className="badge badge-completed">Balanced</span>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Workload fairness index evaluates task complexity and distribution across all active contributors.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                <span>Team Contribution Equity</span>
                <span style={{ color: '#34d399', fontWeight: 700 }}>94%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '94%', height: '100%', background: 'linear-gradient(90deg, #6366f1, #34d399)', borderRadius: '4px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                <span>Task Completion Pace</span>
                <span style={{ color: '#818cf8', fontWeight: 700 }}>On Track</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', background: '#818cf8', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Board Preview / Interactive Tasks List */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>
              Project Tasks & Milestone Board
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Click on any task status badge to toggle state (To Do &rarr; In Progress &rarr; Completed)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sampleTasks.map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                gap: '1rem',
                transition: 'background var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 280px' }}>
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: task.status === 'completed' ? '#34d399' : 'var(--text-subtle)',
                    padding: 0,
                    display: 'flex',
                  }}
                  title="Click to toggle status"
                >
                  <CheckCircle2 size={20} />
                </button>
                <span
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    color: task.status === 'completed' ? 'var(--text-muted)' : '#ffffff',
                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Assignee: <strong style={{ color: '#fff' }}>{task.assignee}</strong>
                </span>

                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`badge badge-${task.status}`}
                  style={{ cursor: 'pointer', border: 'none' }}
                  title="Click to advance status"
                >
                  {task.status}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
