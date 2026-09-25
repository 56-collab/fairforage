import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Tag, 
  Clock, 
  Zap, 
  MessageSquare, 
  Send, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Layers
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TaskDetailModal = ({ isOpen, onClose, taskId, onTaskUpdated, onOpenEditModal }) => {
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      setError('');
      const [taskRes, commentsRes] = await Promise.all([
        api.get(`/tasks/${taskId}`),
        api.get(`/tasks/${taskId}/comments`),
      ]);

      if (taskRes.data.success) {
        setTask(taskRes.data.task);
      }
      if (commentsRes.data.success) {
        setComments(commentsRes.data.comments);
      }
    } catch (err) {
      console.error('Fetch task details error:', err);
      setError(err.response?.data?.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
    }
  }, [isOpen, taskId]);

  if (!isOpen) return null;

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      if (res.data.success) {
        setTask(res.data.task);
        if (onTaskUpdated) onTaskUpdated(res.data.task);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      const res = await api.post(`/tasks/${taskId}/comments`, { content: newComment.trim() });
      if (res.data.success) {
        setComments((prev) => [...prev, res.data.comment]);
        setNewComment('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await api.delete(`/tasks/comments/${commentId}`);
      if (res.data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm(`Are you sure you want to delete "${task?.title}"?`)) {
      try {
        await api.delete(`/tasks/${taskId}`);
        if (onTaskUpdated) onTaskUpdated({ _id: taskId, deleted: true });
        onClose();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const getPriorityBadgeClass = (prio) => {
    switch (prio) {
      case 'critical': return 'badge-danger';
      case 'high': return 'badge-planning';
      case 'medium': return 'badge-active';
      default: return 'badge-completed';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(5, 7, 15, 0.8)',
        backdropFilter: 'blur(10px)',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(15, 20, 45, 0.98)',
          padding: 0,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.2)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className={`badge ${getPriorityBadgeClass(task?.priority)}`}>
              {task?.priority || 'medium'} priority
            </span>
            <span className="badge badge-planning">
              {task?.difficulty || 'medium'} diff ({task?.difficultyWeight || 2} pts)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {task && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenEditModal) onOpenEditModal(task);
                  }}
                  title="Edit task"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    padding: '0.4rem 0.6rem',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.8rem',
                  }}
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button
                  onClick={handleDeleteTask}
                  title="Delete task"
                  style={{
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    borderRadius: '6px',
                    padding: '0.4rem 0.6rem',
                    color: '#fb7185',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.8rem',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '6px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.4rem',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading task details...
            </div>
          ) : error || !task ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#fb7185' }}>
              <AlertCircle size={32} style={{ marginBottom: '0.5rem' }} />
              <div>{error || 'Task not found'}</div>
            </div>
          ) : (
            <>
              {/* Title & Status Bar */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
                  {task.title}
                </h2>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      style={{
                        background: 'rgba(99, 102, 241, 0.2)',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        color: '#c7d2fe',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      <option value="backlog">Backlog</option>
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem' }}>
                    <User size={15} color="#818cf8" />
                    <span style={{ color: 'var(--text-muted)' }}>Assignee:</span>
                    <strong style={{ color: '#ffffff' }}>
                      {task.assignedTo?.name || 'Unassigned'}
                    </strong>
                  </div>

                  {task.dueDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem' }}>
                      <Calendar size={15} color="#f59e0b" />
                      <span style={{ color: 'var(--text-muted)' }}>Due:</span>
                      <span style={{ color: new Date(task.dueDate) < new Date() && task.status !== 'completed' ? '#fb7185' : '#ffffff' }}>
                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Description
                </h4>
                <div
                  style={{
                    fontSize: '0.925rem',
                    color: '#e2e8f0',
                    lineHeight: 1.6,
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {task.description || 'No detailed description provided.'}
                </div>
              </div>

              {/* Skills & Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
                {task.requiredSkills && task.requiredSkills.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.25rem' }}>
                      Required Skills
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {task.requiredSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.2rem 0.55rem',
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '4px',
                            color: '#a5b4fc',
                            fontWeight: 500,
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {task.tags && task.tags.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.25rem' }}>
                      Tags
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {task.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.2rem 0.55rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '4px',
                            color: 'var(--text-muted)',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                  <MessageSquare size={18} color="#38bdf8" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                    Team Discussion ({comments.length})
                  </h3>
                </div>

                {/* Comments List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {comments.length === 0 ? (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                      No comments yet. Start the discussion with your team!
                    </div>
                  ) : (
                    comments.map((c) => {
                      const isOwn = c.user?._id === user?._id || c.user?._id === user?.id;
                      return (
                        <div
                          key={c._id}
                          style={{
                            padding: '0.85rem 1rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '50%',
                                  background: 'var(--accent-gradient)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                }}
                              >
                                {c.user?.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                                {c.user?.name}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                                {new Date(c.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            {isOwn && (
                              <button
                                onClick={() => handleDeleteComment(c._id)}
                                title="Delete comment"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  padding: '2px',
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                            {c.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Write a comment or mention team progress..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={commentLoading || !newComment.trim()}
                    style={{ padding: '0.65rem 1.25rem' }}
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
