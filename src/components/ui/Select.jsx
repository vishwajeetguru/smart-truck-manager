import React, { useState, useRef, useEffect } from 'react';

const Select = ({ label, value, onChange, options = [], placeholder = 'Select', fullWidth = true, name }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        // Mocking an event object to be compatible with typical onChange handlers
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    // Find label for selected value
    const getSelectedLabel = () => {
        const selected = options.find(opt => opt.value === value);
        return selected ? selected.label : placeholder;
    };

    return (
        <div
            ref={containerRef}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                width: fullWidth ? '100%' : 'auto',
                position: 'relative'
            }}
        >
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

            <div
                className="nb-border"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '1rem',
                    backgroundColor: 'var(--color-bg-surface)',
                    color: value ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                    boxShadow: isOpen ? '2px 2px 0px 0px var(--color-border)' : 'var(--shadow-offset) var(--shadow-offset) 0px 0px var(--color-border)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transform: isOpen ? 'translate(2px, 2px)' : 'none',
                    transition: 'all 0.1s'
                }}
            >
                <span style={{ fontWeight: 700 }}>{getSelectedLabel()}</span>
                <span className="material-symbols-outlined" style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                }}>
                    keyboard_arrow_down
                </span>
            </div>

            {isOpen && (
                <div
                    className="nb-border"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'var(--color-bg-surface)',
                        borderRadius: 'var(--radius-lg)',
                        marginTop: '0.5rem',
                        zIndex: 50,
                        boxShadow: 'var(--shadow-offset) var(--shadow-offset) 0px 0px var(--color-border)',
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}
                >
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            style={{
                                padding: '1rem',
                                borderBottom: '1px solid #eee',
                                cursor: 'pointer',
                                fontWeight: 600,
                                backgroundColor: value === option.value ? 'rgba(0,0,0,0.05)' : 'transparent',
                                color: 'var(--color-text-main)'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = value === option.value ? 'rgba(0,0,0,0.05)' : 'transparent'}
                        >
                            {option.label}
                        </div>
                    ))}
                    {options.length === 0 && (
                        <div style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>No options</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Select;
