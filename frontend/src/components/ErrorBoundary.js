import React, { Component } from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={styles.container}>
                    <div style={styles.card}>
                        <h2 style={styles.title}>Something went wrong</h2>
                        <p style={styles.message}>
                            We're sorry, but something unexpected happened. Please try again.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={styles.details}>
                                <summary style={styles.summary}>Error Details</summary>
                                <pre style={styles.errorText}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                        <button style={styles.button} onClick={this.handleRetry}>
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: '#f5f8fa',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '40px',
        maxWidth: '500px',
        textAlign: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    title: {
        color: '#000000',
        marginBottom: '16px',
        fontSize: '24px',
    },
    message: {
        color: '#6f787e',
        marginBottom: '24px',
        lineHeight: '1.5',
    },
    details: {
        marginBottom: '24px',
        textAlign: 'left',
    },
    summary: {
        cursor: 'pointer',
        color: '#6f787e',
        marginBottom: '8px',
    },
    errorText: {
        backgroundColor: '#f5f8fa',
        padding: '12px',
        borderRadius: '4px',
        fontSize: '12px',
        overflow: 'auto',
        maxHeight: '200px',
    },
    button: {
        backgroundColor: '#00c805',
        color: '#ffffff',
        border: 'none',
        borderRadius: '24px',
        padding: '12px 32px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
};

export default ErrorBoundary;
