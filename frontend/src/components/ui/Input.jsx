import React from 'react';

const Input = ({ label, error, className, fullWidth = true, ...props }) => {
    const { style, ...restProps } = props;

    return (
        <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''} ${className || ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: fullWidth ? '100%' : 'auto' }}>
            {label && (
                <label style={{
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {label}
                </label>
            )}
            <input
                className="nb-border"
                style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '1rem',
                    backgroundColor: 'var(--color-bg-surface)',
                    color: 'var(--color-text-main)',
                    outline: 'none',
                    boxShadow: 'var(--shadow-offset) var(--shadow-offset) 0px 0px var(--color-border)',
                    transition: 'all 0.2s',
                    width: '100%',
                    ...style
                }}
                {...restProps}
            />
            {error && <span style={{ color: 'var(--color-error)', fontSize: '0.75rem', fontWeight: 600 }}>{error}</span>}
        </div>
    );
};

export default Input;
