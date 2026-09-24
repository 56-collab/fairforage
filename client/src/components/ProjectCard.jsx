import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Trash2, 
  Tag, 
  Crown 
} from 'lucide-react';

const ProjectCard = ({ project, currentUserId, onDelete }) => {
  const isOwner = project.owner && (project.owner._id === currentUserId || project.owner === currentUserId);
  const memberCount = (project.members?.length || 0) + (isOwner ? 0 : 1);
  const status = project.status || 'active';

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '260px',
      }}
    >
      <div>
        {/* Card Header: Status & Owner Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <span className={`badge badge-${status}`}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: status === 'completed' ? '#10b981' : '#6366f1',
              }}
            />
            {status}
          </span>

          {isOwner && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                color: '#f59e0b',
                background: 'rgba(245, 158, 11, 0.12)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
              }}
            >
              <Crown size={12} />
              Owner
            </span>
          )}
        </div>

        {/* Project Title */}
        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            lineHeight: 1.3,
            color: '#ffffff',
          }}
        >
          <Link
            to={`/project/${project._id}`}
            style={{
              textDecoration: 'none',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#818cf8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#ffffff')}
          >
            {project.name}
          </Link>
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: '1.25rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {project.description || 'No description provided for this team workspace.'}
        </p>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.4rem',
              marginBottom: '1.25rem',
            }}
          >
            {project.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.72rem',
                  padding: '0.15rem 0.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '4px',
                  color: 'var(--text-subtle)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info & CTA */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Users size={14} color="#818cf8" />
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={14} color="var(--text-subtle)" />
            <span>
              {new Date(project.updatedAt || project.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(project._id, project.name)}
              title="Delete project"
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                borderRadius: '6px',
                padding: '0.4rem',
                color: '#fb7185',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(244, 63, 94, 0.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)')}
            >
              <Trash2 size={14} />
            </button>
          )}

          <Link
            to={`/project/${project._id}`}
            className="btn btn-secondary"
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              gap: '0.3rem',
            }}
          >
            Open
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
