import React, { useState } from 'react';
import { X, UserPlus, Search, Check, AlertCircle, Shield } from 'lucide-react';
import api from '../api/axios';

const InviteMemberModal = ({ isOpen, onClose, projectId, onMemberAdded }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState('developer');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const res = await api.get(`/auth/search?q=${encodeURIComponent(query.trim())}`);
      if (res.data.success) {
        setSearchResults(res.data.users);
      }
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUser && !emailInput.trim()) {
      setError('Please select a user or enter an email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const payload = {
        role,
        ...(selectedUser ? { userId: selectedUser._id } : { email: emailInput.trim() }),
      };

      const res = await api.post(`/projects/${projectId}/members`, payload);
      if (res.data.success) {
        setSuccess(res.data.message || 'Member added successfully!');
        if (onMemberAdded) onMemberAdded(res.data.project);
        setTimeout(() => {
          setSelectedUser(null);
          setSearchQuery('');
          setEmailInput('');
          setSearchResults([]);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Add member error:', err);
      setError(err.response?.data?.message || 'Failed to add member to team');
    } finally {
      setLoading(false);
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
          maxWidth: '500px',
          background: 'rgba(15, 20, 45, 0.98)',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(99, 102, 241, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <UserPlus size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                Add Team Member
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Invite a collaborator to your workspace
              </p>
            </div>
          </div>

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

        {/* Alerts */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1rem',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: '#fda4af',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: '#6ee7b7',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
            }}
          >
            <Check size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAddMember}>
          {/* User Search Input */}
          <div className="form-group">
            <label className="form-label">Search Registered User</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
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

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div
                style={{
                  marginTop: '0.5rem',
                  maxHeight: '160px',
                  overflowY: 'auto',
                  background: 'rgba(10, 13, 30, 0.95)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.35rem',
                }}
              >
                {searchResults.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => {
                      setSelectedUser(u);
                      setSearchQuery(u.name);
                      setSearchResults([]);
                    }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: selectedUser?._id === u._id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        selectedUser?._id === u._id ? 'rgba(99, 102, 241, 0.2)' : 'transparent')
                    }
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                    {u.skills?.length > 0 && (
                      <span style={{ fontSize: '0.7rem', color: '#a5b4fc', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        {u.skills[0]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.75rem', margin: '0.5rem 0' }}>
            — OR INVITE BY EMAIL —
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="invite-email">
              Direct Email
            </label>
            <input
              id="invite-email"
              type="email"
              className="form-control"
              placeholder="teammate@university.edu"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                setSelectedUser(null);
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="member-role">
              Project Role
            </label>
            <select
              id="member-role"
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="lead">Project Lead</option>
              <option value="developer">Developer</option>
              <option value="designer">Designer</option>
              <option value="member">General Member</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.75rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '130px' }}
            >
              {loading ? 'Adding...' : 'Add to Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
