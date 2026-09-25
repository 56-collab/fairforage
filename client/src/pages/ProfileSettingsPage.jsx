import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  GitBranch, 
  Save, 
  Check, 
  AlertCircle, 
  Plus, 
  X, 
  Sparkles,
  Shield
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ProfileSettingsPage = () => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification Preferences
  const [notifPrefs, setNotifPrefs] = useState({
    taskAssigned: true,
    deadlineApproaching: true,
    workloadAlerts: true,
    comments: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setGithubUsername(user.githubUsername || '');
      setSkills(user.skills || []);
      if (user.notificationPreferences) {
        setNotifPrefs({ ...user.notificationPreferences });
      }
    }
  }, [user]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await api.put('/auth/profile', {
        name,
        bio,
        githubUsername,
        skills,
        notificationPreferences: notifPrefs,
      });

      if (res.data.success) {
        setSuccess('Profile details saved successfully!');
        localStorage.setItem('fairforge_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await api.put('/auth/password', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        setSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem', maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Account & Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Manage your developer profile, skills portfolio, and security settings
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '2rem',
        }}
      >
        <button
          onClick={() => { setActiveTab('profile'); setError(''); setSuccess(''); }}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'profile' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === 'profile' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <User size={16} /> Profile & Skills
        </button>

        <button
          onClick={() => { setActiveTab('security'); setError(''); setSuccess(''); }}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'security' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === 'security' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Lock size={16} /> Security
        </button>

        <button
          onClick={() => { setActiveTab('notifications'); setError(''); setSuccess(''); }}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'notifications' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === 'notifications' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Bell size={16} /> Notifications
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.85rem 1rem',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#fda4af',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
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
            padding: '0.85rem 1rem',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#6ee7b7',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
          }}
        >
          <Check size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* TAB 1: Profile & Skills */}
      {activeTab === 'profile' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-control"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio & Developer Role</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="e.g. Full-Stack Developer passionate about distributed systems and clean UX"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">GitHub Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. octocat"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                Used to automatically map commits and pull requests to your FairForge account.
              </span>
            </div>

            {/* Skills Manager */}
            <div className="form-group">
              <label className="form-label">Skills & Tech Portfolio</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Add skill (e.g. React, Node.js, Python, UI/UX)..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn btn-secondary"
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              {/* Skills badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.75rem',
                      background: 'rgba(99, 102, 241, 0.18)',
                      border: '1px solid rgba(99, 102, 241, 0.35)',
                      borderRadius: 'var(--radius-full)',
                      color: '#c7d2fe',
                      fontSize: '0.825rem',
                      fontWeight: 500,
                    }}
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fda4af',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ minWidth: '150px' }}
              >
                <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Security & Password */}
      {activeTab === 'security' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Change Account Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password (min. 6 characters)</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ minWidth: '160px' }}
              >
                <Lock size={16} /> {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Notifications */}
      {activeTab === 'notifications' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Notification Preferences</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#fff' }}>Task Assignment Alerts</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Get notified when a task is assigned or reassigned to you</div>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.taskAssigned}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, taskAssigned: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#fff' }}>Upcoming Deadlines & Overdue Alerts</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reminders when a task deadline is approaching</div>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.deadlineApproaching}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, deadlineApproaching: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#fff' }}>Workload Imbalance & Redistribution Suggestions</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Notifications regarding project workload health & recommendations</div>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.workloadAlerts}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, workloadAlerts: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#fff' }}>Discussion Comments</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Get notified when team members comment on your assigned tasks</div>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.comments}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, comments: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer' }}
              />
            </label>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSaveProfile}
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '150px' }}
            >
              <Save size={16} /> Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettingsPage;
