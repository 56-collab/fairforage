import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RectangleButtons } from '../shaders/rectangle-buttons/RectangleButtons';
import FairForgeBackground from '../components/effects/FairForgeBackground';
import '../shaders/threeui.css';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  BarChart3, 
  Users2, 
  Layers, 
  CheckCircle2, 
  Cpu, 
  GitBranch, 
  Activity
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleBloomCtaClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div style={{ position: 'relative', paddingBottom: '5rem', overflow: 'hidden' }}>
      {/* Hero Section */}
      <section
        style={{
          paddingTop: '4.5rem',
          paddingBottom: '4rem',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Ambient ThreeUI ElementsCollection Fire Background */}
        <FairForgeBackground />

        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '900px' }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-full)',
              color: '#c7d2fe',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.75rem',
            }}
          >
            <Sparkles size={16} color="#818cf8" />
            <span>Next-Gen Student & Software Team Workspace</span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.75rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1.5rem',
              letterSpacing: '-0.03em',
            }}
          >
            Equal Effort.{' '}
            <span
              style={{
                background: 'var(--accent-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Intelligent Workload.
            </span>
            <br />
            Better Software Projects.
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
              maxWidth: '720px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            FairForge empowers student cohorts and software engineering teams to assign
            tasks equitably, track real contribution metrics, and eliminate project burnout.
          </p>

          {/* CTA Buttons with ThreeUI RectangleButtons (Bloom Outline Button) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Primary Interactive Bloom Outline CTA */}
            <div
              onClick={handleBloomCtaClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleBloomCtaClick();
                }
              }}
              style={{
                display: 'inline-block',
                cursor: 'pointer',
                borderRadius: '8px',
                outline: 'none',
              }}
              title={isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
            >
              <RectangleButtons
                variant="bloom-outline-button"
                mode="dark"
                hue={0}
                saturation={1.00}
                brightness={1.00}
                style={{
                  minHeight: 'unset',
                  height: 'auto',
                  background: 'transparent',
                  padding: 0,
                  width: 'auto',
                  display: 'inline-flex',
                }}
              />
            </div>

            {/* Secondary Standard Action */}
            {!isAuthenticated && (
              <Link
                to="/login"
                className="btn btn-secondary"
                style={{
                  padding: '0.85rem 1.75rem',
                  fontSize: '0.95rem',
                  height: '46px',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <div className="container">
          <div
            style={{
              textAlign: 'center',
              marginBottom: '3rem',
            }}
          >
            <h2 style={{ fontSize: '1.85rem', marginBottom: '0.75rem' }}>
              Built to Solve Team Imbalance
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              A modern foundation engineered for clarity, transparency, and collaboration.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Feature 1 */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#818cf8',
                  marginBottom: '1.25rem',
                }}
              >
                <Users2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>
                Collaborative Team Workspaces
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Create projects, invite team members, assign lead and developer roles, and keep
                everyone synchronized with a unified workspace.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(236, 72, 153, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f472b6',
                  marginBottom: '1.25rem',
                }}
              >
                <BarChart3 size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>
                Workload Intelligence
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Track active task loads per member to identify overburdened developers or
                idle contributors early before project deadlines slip.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#22d3ee',
                  marginBottom: '1.25rem',
                }}
              >
                <Activity size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>
                Transparent Contribution
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Full visibility into who completed what task, providing fair grading for
                student teams and objective performance insights for leads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Architecture Highlights */}
      <section style={{ paddingTop: '2rem' }}>
        <div className="container">
          <div
            className="glass-panel"
            style={{
              padding: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              background: 'linear-gradient(135deg, rgba(19, 25, 56, 0.8), rgba(13, 17, 38, 0.9))',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Cpu size={24} color="#818cf8" />
              <h3 style={{ fontSize: '1.35rem' }}>MERN Full-Stack Foundation</h3>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
              }}
            >
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, color: '#818cf8', marginBottom: '0.25rem' }}>React (Vite)</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>High-performance mobile-first SPA with Glassmorphism</div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '0.25rem' }}>Node + Express</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Robust REST API with JWT security and middleware guards</div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '0.25rem' }}>MongoDB + Mongoose</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Scalable schematized models for users, teams, and projects</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
