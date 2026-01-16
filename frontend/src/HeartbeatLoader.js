import React from 'react';
import './App.css';

export const HeartbeatLoader = ({ splash = false }) => {
    return (
        <div className="heartbeat-loader-container">
            {splash && <h1 className="heartbeat-title">StockPlay</h1>}
            <svg className="heartbeat-svg" viewBox="0 0 100 50" preserveAspectRatio="none">
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {/* Stock Chart Line: Volatile upward trend */}
                <path
                    d="M0 45 L10 40 L20 42 L30 30 L40 35 L50 15 L60 25 L70 10 L80 20 L90 5 L100 0"
                    className="heartbeat-line"
                    filter="url(#glow)"
                />
            </svg>
            <div className="heartbeat-text">
                {splash ? 'Initializing Market Data...' : 'Loading...'}
            </div>
        </div>
    );
};

export default HeartbeatLoader;
