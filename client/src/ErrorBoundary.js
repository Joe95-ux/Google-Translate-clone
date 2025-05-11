import React from "react";
import { toast } from "sonner";
import PropTypes from "prop-types";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log error to error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Customize toast based on error type if needed
    const errorMessage = this.props.errorMessage || 
      "Something went wrong. Please refresh the page or try again later.";
    
    toast.error(errorMessage, {
      duration: 5000,
      action: {
        label: "Dismiss",
        onClick: () => {}
      }
    });

    // You could also send the error to an error tracking service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.handleReset
        });
      }

      return (
        <div className="error-boundary" style={{ 
          padding: "20px", 
          textAlign: "center",
          maxWidth: "800px",
          margin: "0 auto"
        }}>
          <h2 style={{ color: "#ff4d4f" }}>Oops! Something went wrong.</h2>
          
          {this.props.showDetails && (
            <details style={{ 
              whiteSpace: "pre-wrap", 
              textAlign: "left",
              margin: "20px 0",
              padding: "15px",
              backgroundColor: "#fff2f0",
              borderRadius: "4px"
            }}>
              <summary style={{ cursor: "pointer", marginBottom: "10px" }}>
                Error Details
              </summary>
              <div style={{ fontFamily: "monospace" }}>
                <strong>Error:</strong> {this.state.error?.toString()}
                <br /><br />
                <strong>Stack trace:</strong> {this.state.error?.stack}
                <br /><br />
                <strong>Component stack:</strong> {this.state.errorInfo?.componentStack}
              </div>
            </details>
          )}
          
          <button
            onClick={this.handleReset}
            style={{
              padding: "8px 16px",
              backgroundColor: "#1890ff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallbackComponent: PropTypes.func,
  onReset: PropTypes.func,
  errorMessage: PropTypes.string,
  showDetails: PropTypes.bool
};

ErrorBoundary.defaultProps = {
  showDetails: process.env.NODE_ENV !== "production"
};

export default ErrorBoundary;