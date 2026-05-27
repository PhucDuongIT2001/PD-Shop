import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught a fatal crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          color: '#e11d48',
          background: '#fff1f2',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            background: 'white',
            padding: '30px',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
            border: '1px solid #ffe4e6'
          }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#be123c' }}>
              Oops! Frontend Crashed 💥
            </h1>
            <p style={{ color: '#4b5563', marginBottom: '20px', fontSize: '14px' }}>
              React Error Boundary caught a fatal runtime exception during mount or rendering.
            </p>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '16px',
              borderRadius: '8px',
              overflowX: 'auto',
              marginBottom: '20px'
            }}>
              <strong style={{ fontSize: '14px', color: '#1e293b' }}>Error Message:</strong>
              <div style={{ color: '#e11d48', fontFamily: 'monospace', fontSize: '13px', marginTop: '4px', fontWeight: 'bold' }}>
                {this.state.error?.toString()}
              </div>
            </div>
            <strong style={{ fontSize: '14px', color: '#1e293b' }}>Stack Trace:</strong>
            <pre style={{
              background: '#0f172a',
              color: '#38bdf8',
              padding: '16px',
              borderRadius: '8px',
              overflowX: 'auto',
              fontFamily: 'monospace',
              fontSize: '12px',
              marginTop: '4px',
              maxHeight: '300px',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error?.stack}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
