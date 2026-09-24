import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeMap = {
    sm: '24px',
    md: '40px',
    lg: '60px',
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem',
        gap: '1rem',
        minHeight: '200px',
      }}
    >
      <div
        style={{
          width: dim,
          height: dim,
          borderRadius: '50%',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: '#6366f1',
          animation: 'spin 0.8s linear infinite',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
        }}
      />
      {message && (
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          {message}
        </p>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
