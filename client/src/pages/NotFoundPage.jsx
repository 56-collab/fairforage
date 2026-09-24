import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div className="glass-panel" style={{ padding: '3.5rem 2rem', maxWidth: '480px', width: '100%' }}>
        <div
          style={{
            fontSize: '4.5rem',
            fontWeight: 800,
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
            marginBottom: '1rem',
          }}
        >
          404
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '2rem' }}>
          The page or project you're looking for doesn't exist or has moved.
        </p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
