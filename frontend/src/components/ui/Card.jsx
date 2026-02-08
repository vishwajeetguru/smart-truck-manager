import React from 'react';

const Card = ({ children, className, noPadding = false, ...props }) => {
    return (
        <div
            className={`nb-border ${className || ''}`}
            style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '4px 4px 0px 0px var(--color-border)',
                padding: noPadding ? '0' : '1.5rem',
                overflow: 'hidden'
            }}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
