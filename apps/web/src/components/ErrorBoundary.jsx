import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('❌ ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback UI if provided, otherwise use default
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent) {
        return (
          <FallbackComponent 
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            retry={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          />
        );
      }

      // Default error UI
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1 style={{ color: '#dc3545' }}>🚨 Something went wrong</h1>
          <p style={{ maxWidth: '600px', margin: '20px 0' }}>
            ProCalendar encountered an unexpected error. This is usually temporary.
          </p>
          
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              marginBottom: '20px'
            }}
          >
            🔄 Reload Application
          </button>

          {process.env.NODE_ENV === 'development' && (
            <details style={{ maxWidth: '800px', width: '100%' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                🔍 Debug Information (Development Only)
              </summary>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '5px',
                textAlign: 'left',
                fontSize: '14px'
              }}>
                <strong>Error:</strong>
                <pre style={{ 
                  background: '#ffffff', 
                  padding: '10px', 
                  borderRadius: '3px',
                  overflow: 'auto',
                  margin: '5px 0'
                }}>
                  {this.state.error && this.state.error.toString()}
                </pre>
                
                <strong>Component Stack:</strong>
                <pre style={{ 
                  background: '#ffffff', 
                  padding: '10px', 
                  borderRadius: '3px',
                  overflow: 'auto',
                  margin: '5px 0'
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;