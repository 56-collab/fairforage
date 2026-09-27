import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectDashboardPage from './pages/ProjectDashboardPage';
import PersonalDashboardPage from './pages/PersonalDashboardPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import CreateProjectModal from './components/CreateProjectModal';

function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Navbar onOpenCreateModal={() => setIsCreateModalOpen(true)} />

      {/* Main Viewport */}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage
                  isCreateModalOpen={isCreateModalOpen}
                  setIsCreateModalOpen={setIsCreateModalOpen}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-dashboard"
            element={
              <ProtectedRoute>
                <PersonalDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <ProfileSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project/:id/dashboard"
            element={
              <ProtectedRoute>
                <ProjectDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId/dashboard"
            element={
              <ProtectedRoute>
                <ProjectDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project/:id"
            element={
              <ProtectedRoute>
                <ProjectDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Global Project Modal instance for Navbar button */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={() => {
          window.location.reload();
        }}
      />

      {/* Clean Glassmorphic Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--glass-border)',
          background: 'rgba(6, 8, 16, 0.88)',
          backdropFilter: 'blur(16px)',
          padding: '2rem 0',
          marginTop: 'auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            <span style={{ fontWeight: 700, color: '#ffffff' }}>FairForge</span> — Intelligent Team Contribution & Workload Management
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', color: 'var(--text-subtle)', fontSize: '0.8rem' }}>
            <span>Equal Effort. Intelligent Workload. Better Software Projects.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
