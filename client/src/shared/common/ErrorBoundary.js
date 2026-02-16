import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-dark bg-gradient">
          <div
            className="card shadow-lg border-0 rounded-3 text-center p-5"
            style={{ maxWidth: 520, width: "100%" }}
          >
            <h4 className="text-danger fw-semibold mb-2">
              Something went wrong
            </h4>

            <p className="text-muted mb-4">
              An unexpected error occurred. Please refresh the page to continue.
            </p>

            <button
              className="btn btn-success px-4 py-2"
              onClick={this.handleReload}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
