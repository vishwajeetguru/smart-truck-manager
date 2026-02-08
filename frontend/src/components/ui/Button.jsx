import React from 'react';
import clsx from 'clsx'; // Using clsx for conditional classes if installed, otherwise template literals. 
// I installed clsx and tailwind-merge (though not using tailwind, clsx is good for strings).

const Button = ({
    children,
    variant = 'primary',
    className,
    fullWidth = false,
    ...props
}) => {

    // Base styles are in global.css under .nb-button
    // But we need variant specific colors

    const getVariantStyle = () => {
        switch (variant) {
            case 'primary':
                return {
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    '--color-border': 'var(--color-border)' // Inherit
                };
            case 'secondary':
                return {
                    backgroundColor: 'var(--color-bg-surface)',
                    color: 'var(--color-text-main)',
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-main)',
                };
            case 'accent':
                return {
                    backgroundColor: 'var(--color-accent)',
                    color: '#ffffff',
                }
            default:
                return {};
        }
    };

    const style = {
        width: fullWidth ? '100%' : 'auto',
        padding: '1rem 1.5rem',
        fontSize: '1rem',
        ...getVariantStyle()
    };

    return (
        <button
            className={`nb-button ${className || ''}`}
            style={style}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
