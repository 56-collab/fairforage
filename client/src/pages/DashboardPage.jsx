import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  PlusCircle, 
  FolderGit2, 
  Search, 
  Filter, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  BarChart,
  Users
} from 'lucide-react';

const DashboardPage = ({ isCreateModalOpen, setIsCreateModalOpen }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/projects');
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.message || 'Failed to load projects from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = (newProject) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (window.confirm(`Are you sure you want to delete "${projectName}"? This cannot be undone.`)) {
      try {
        const res = await api.delete(`/projects/${projectId}`);
        if (res.data.success) {
          setProjects((prev) => prev.filter((p) => p._id !== projectId));
        }
      } catch (err) {
        console.error('Delete project error:', err);
        alert(err.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  // Filter projects based on query and status filter
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (project.tags && project.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Welcome Banner / Overview Stats */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          marginBottom: '2.5rem',
          background: 'linear-gradient(135deg, rgba(20, 27, 65, 0.7) 0%, rgba(13, 17, 38, 0.9) 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                color: '#818cf8',
                fontWeight: 600,
                marginBottom: '0.4rem',
              }}
            >
              <Sparkles size={14} />
              Platform Overview
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>
              Welcome back, {user?.name || 'Developer'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Here are your active team workspaces and workload balance metrics.
            </p>
          </div>
        </div>

        {/* Quick Stat Highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Total Projects
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
              {projects.length}
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Active Workspaces
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#818cf8' }}>
              {projects.filter((p) => p.status === 'active' || p.status === 'in-progress').length}
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Workload Health
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>
              Optimal (100%)
            </div>
          </div>
        </div>
      </div>

      {/* Projects Controls Bar: Search, Status Filters, New Project */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Search Box */}
          <div
            style={{
              position: 'relative',
              flex: '1 1 280px',
              maxWidth: '400px',
            }}
          >
            <input
              type="text"
              className="form-control"
              placeholder="Search workspaces by name or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.9rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-subtle)',
              }}
            />
          </div>

          {/* New Project CTA Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '0.7rem 1.4rem' }}
          >
            <PlusCircle size={18} />
            Create Project
          </button>
        </div>

        {/* Filter Pills */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem',
          }}
        >
          {['all', 'active', 'in-progress', 'planning', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: statusFilter === status ? '#6366f1' : 'var(--glass-border)',
                background:
                  statusFilter === status
                    ? 'rgba(99, 102, 241, 0.25)'
                    : 'rgba(255, 255, 255, 0.04)',
                color: statusFilter === status ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid Content */}
      {loading ? (
        <LoadingSpinner message="Fetching your project workspaces..." size="lg" />
      ) : error ? (
        <div
          className="glass-panel"
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            borderColor: 'rgba(244, 63, 94, 0.3)',
          }}
        >
          <AlertCircle size={36} color="#fb7185" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>Failed to Load Projects</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={fetchProjects} className="btn btn-secondary">
            Retry Connection
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
              marginBottom: '1.25rem',
            }}
          >
            <FolderGit2 size={32} />
          </div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
            {searchQuery || statusFilter !== 'all'
              ? 'No matching projects found'
              : 'No projects created yet'}
          </h3>
          <p
            style={{
              color: 'var(--text-muted)',
              maxWidth: '440px',
              fontSize: '0.9rem',
              marginBottom: '1.75rem',
            }}
          >
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search terms or filter settings.'
              : 'Create your first team project to start organizing tasks, balancing workloads, and tracking fair contributions.'}
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
            <PlusCircle size={18} />
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid-cards">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              currentUserId={user?._id || user?.id}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default DashboardPage;
