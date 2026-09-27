import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FairForgeBackground from '../components/effects/FairForgeBackground';
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
  Activity,
  Zap,
  TrendingUp,
  Scale,
  BrainCircuit,
  Workflow,
  Check,
  ChevronRight,
  GitPullRequest,
  Clock,
  Lock
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Primary ThreeUI LandscapeScene Night Atmospheric Environment */}
      <FairForgeBackground />

      {/* Hero Section */}
      <section
        style={{
          paddingTop: '5rem',
          paddingBottom: '5.5rem',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div className="container" style={{ maxWidth: '920px' }}>
          {/* Subtle Moonlit Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1.1rem',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-full)',
              color: '#c7d2fe',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '2rem',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)',
            }}
          >
            <Sparkles size={15} color="#818cf8" />
            <span>Intelligent Team Workload Platform</span>
          </div>

          {/* Main Hero Heading */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1.5rem',
              letterSpacing: '-0.03em',
              color: '#ffffff',
            }}
          >
            Equal Effort.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Intelligent Workload.
            </span>
            <br />
            Better Software Projects.
          </h1>

          {/* Supporting Subtitle */}
          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '2.75rem',
              maxWidth: '740px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            FairForge helps student software engineering cohorts and development teams understand workload,
            track authentic project activity, identify imbalances early, and make explainable task allocation decisions.
          </p>

          {/* Core FairForge CTAs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn btn-primary"
                style={{
                  padding: '0.9rem 2.25rem',
                  fontSize: '1rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                Go to Workspace Dashboard
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  style={{
                    padding: '0.9rem 2.25rem',
                    fontSize: '1rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  Get Started Free
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/login"
                  className="btn btn-secondary"
                  style={{
                    padding: '0.9rem 2rem',
                    fontSize: '1rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Feature Grid / Core Product Values */}
      <section style={{ paddingTop: '1.5rem', paddingBottom: '4.5rem', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.65rem', letterSpacing: '-0.02em' }}>
              Built to Eliminate Team Imbalance
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
              Transparent, explainable intelligence that gives every team member clear visibility and fair recognition.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Value 1: Workload Intelligence */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60a5fa',
                  marginBottom: '1.25rem',
                }}
              >
                <Zap size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
                Intelligent Workload Management
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Understand how work is distributed across your team in real time based on active tasks, effort weights, priority, and upcoming deadlines.
              </p>
            </div>

            {/* Value 2: Contribution Activity */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                  marginBottom: '1.25rem',
                }}
              >
                <BarChart3 size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
                Contribution Activity
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                See comprehensive activity across completed tasks, code reviews, and connected GitHub repositories without arbitrary judgment.
              </p>
            </div>

            {/* Value 3: Imbalance Detection */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24',
                  marginBottom: '1.25rem',
                }}
              >
                <Scale size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
                Workload Imbalance Detection
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Automatically detect when individual contributors are overburdened or idle before deadlines slip and team burnout occurs.
              </p>
            </div>

            {/* Value 4: Explainable Recommendations */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(168, 85, 247, 0.12)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c084fc',
                  marginBottom: '1.25rem',
                }}
              >
                <BrainCircuit size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
                Explainable Recommendations
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Get transparent task redistribution suggestions based on current workload, estimated effort, deadlines, and matched member skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How FairForge Works Workflow Section */}
      <section style={{ padding: '4rem 0', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div className="glass-panel" style={{ padding: '3rem 2.5rem', background: 'linear-gradient(135deg, rgba(11, 16, 32, 0.8) 0%, rgba(6, 8, 16, 0.95) 100%)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ARCHITECTURE OF FAIR ALLOCATION
              </span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.4rem' }}>
                How FairForge Intelligence Works
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', alignItems: 'center' }}>
              {/* Step 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                  1
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>Capture Continuous Signals</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Tasks, status transitions, commit frequencies, pull requests, and member skill profiles are tracked continuously.
                </p>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                  2
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>Evaluate Workload Health</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Mathematical variance engines compute active workload disparities relative to the team median without black-box bias.
                </p>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                  3
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>Actionable Redistribution</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  When imbalance emerges, leads receive explainable reassignment recommendations that can be reviewed and approved with 1 click.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section style={{ padding: '4.5rem 0 5rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Build better-balanced software teams.
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Give student cohorts and development teams the clarity, equity, and workload intelligence they need to succeed.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="btn btn-primary"
              style={{
                padding: '0.85rem 2rem',
                fontSize: '0.95rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {isAuthenticated ? 'Open Dashboard' : 'Get Started Free'}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
