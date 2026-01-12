import React from 'react';
import PropTypes from 'prop-types';

class ServiceErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error(`${this.props.serviceName} Error:`, error);
    console.error('Error Info:', errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Optional: Send error to logging service
    if (this.props.onError) {
      this.props.onError(error, errorInfo, this.props.serviceName);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI or default error message
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ServiceUnavailableMessage
          serviceName={this.props.serviceName}
          onRetry={this.props.showRetry ? this.handleRetry : null}
          error={this.state.error}
        />
      );
    }

    return this.props.children;
  }
}

ServiceErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  serviceName: PropTypes.string.isRequired,
  fallback: PropTypes.node,
  onError: PropTypes.func,
  showRetry: PropTypes.bool
};

ServiceErrorBoundary.defaultProps = {
  fallback: null,
  onError: null,
  showRetry: true
};

// Default error message component
const ServiceUnavailableMessage = ({ serviceName, onRetry, error }) => (
  <div className="service-error-message" style={{
    padding: '20px',
    margin: '10px 0',
    border: '1px solid #ff6b6b',
    borderRadius: '8px',
    backgroundColor: '#fff5f5',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
    <h3 style={{
      color: '#d32f2f',
      margin: '0 0 10px 0',
      fontSize: '16px',
      fontWeight: '600'
    }}>
      {serviceName} Unavailable
    </h3>
    <p style={{
      color: '#666',
      margin: '0 0 15px 0',
      fontSize: '14px'
    }}>
      This feature is temporarily unavailable. Other admin functions remain accessible.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          padding: '8px 16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Try Again
      </button>
    )}
    {process.env.NODE_ENV === 'development' && error && (
      <details style={{ marginTop: '10px', textAlign: 'left' }}>
        <summary style={{ cursor: 'pointer', color: '#666', fontSize: '12px' }}>
          Error Details (Dev Mode)
        </summary>
        <pre style={{
          background: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto',
          marginTop: '5px'
        }}>
          {error.toString()}
        </pre>
      </details>
    )}
  </div>
);

ServiceUnavailableMessage.propTypes = {
  serviceName: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
  error: PropTypes.object
};

export default ServiceErrorBoundary;