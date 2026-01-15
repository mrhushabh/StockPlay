import React, { memo } from 'react';

/**
 * Loading Spinner Component
 * Reusable loading indicator
 */
export const LoadingSpinner = memo(({ size = 'medium', message = 'Loading...' }) => {
    const sizeStyles = {
        small: { width: 20, height: 20 },
        medium: { width: 40, height: 40 },
        large: { width: 60, height: 60 }
    };

    return (
        <div style={styles.container}>
            <div style={{ ...styles.spinner, ...sizeStyles[size] }} />
            {message && <p style={styles.message}>{message}</p>}
        </div>
    );
});

LoadingSpinner.displayName = 'LoadingSpinner';

/**
 * Error Display Component
 * Reusable error message with retry
 */
export const ErrorDisplay = memo(({ message, onRetry }) => (
    <div style={styles.errorContainer}>
        <p style={styles.errorIcon}>⚠️</p>
        <p style={styles.errorMessage}>{message || 'Something went wrong'}</p>
        {onRetry && (
            <button style={styles.retryButton} onClick={onRetry}>
                Try Again
            </button>
        )}
    </div>
));

ErrorDisplay.displayName = 'ErrorDisplay';

/**
 * Empty State Component
 * Reusable empty state display
 */
export const EmptyState = memo(({ icon = '📋', title, message, action }) => (
    <div style={styles.emptyContainer}>
        <p style={styles.emptyIcon}>{icon}</p>
        <h4 style={styles.emptyTitle}>{title}</h4>
        {message && <p style={styles.emptyMessage}>{message}</p>}
        {action && (
            <button style={styles.actionButton} onClick={action.onClick}>
                {action.label}
            </button>
        )}
    </div>
));

EmptyState.displayName = 'EmptyState';

/**
 * Card Component
 * Reusable card wrapper
 */
export const Card = memo(({ children, className = '', style = {} }) => (
    <div className={`card ${className}`} style={{ ...styles.card, ...style }}>
        {children}
    </div>
));

Card.displayName = 'Card';

/**
 * StatRow Component
 * Reusable label-value row
 */
export const StatRow = memo(({ label, value, valueClass = '' }) => (
    <div className="stat-row">
        <span className="stat-label">{label}:</span>
        <span className={`stat-value ${valueClass}`}>{value}</span>
    </div>
));

StatRow.displayName = 'StatRow';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
    },
    spinner: {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #00c805',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    message: {
        marginTop: '16px',
        color: '#6f787e',
    },
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px',
        textAlign: 'center',
    },
    errorIcon: {
        fontSize: '48px',
        marginBottom: '16px',
    },
    errorMessage: {
        color: '#ff5000',
        marginBottom: '16px',
    },
    retryButton: {
        backgroundColor: '#00c805',
        color: '#fff',
        border: 'none',
        borderRadius: '24px',
        padding: '12px 32px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    emptyContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '60px 20px',
        textAlign: 'center',
    },
    emptyIcon: {
        fontSize: '64px',
        marginBottom: '16px',
    },
    emptyTitle: {
        color: '#000',
        marginBottom: '8px',
        fontSize: '18px',
    },
    emptyMessage: {
        color: '#6f787e',
        marginBottom: '24px',
    },
    actionButton: {
        backgroundColor: '#00c805',
        color: '#fff',
        border: 'none',
        borderRadius: '24px',
        padding: '12px 32px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        marginBottom: '16px',
    },
};

// CSS for spinner animation (inject once)
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
    document.head.appendChild(styleSheet);
}
