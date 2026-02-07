import React, { useState } from 'react';

const Accordion = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div style={{
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '0.75rem',
            background: 'var(--color-bg-surface)',
            boxShadow: '2px 2px 0 0 var(--color-border)'
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: isOpen ? 'var(--color-primary)10' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                }}
            >
                <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>{title}</span>
                <span className="material-symbols-outlined" style={{
                    transition: 'transform 0.2s',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0)'
                }}>
                    expand_more
                </span>
            </button>

            {isOpen && (
                <div style={{
                    padding: '1rem',
                    borderTop: '2px solid var(--color-border)',
                    background: '#fff'
                }}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default Accordion;
