const Header = ({ onMenuClick }) => {

    return (
        <header style={{
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--color-bg-surface)',
            borderBottom: '4px solid var(--color-border)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 4px 0 0 rgba(0,0,0,0.05)'
        }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                    width: '2rem', height: '2rem',
                    background: 'var(--color-primary)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '1.25rem' }}>local_shipping</span>
                </div>
                <h1 style={{ fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--color-text-main)' }}>
                    Truck<span style={{ color: 'var(--color-primary)' }}>Manager</span>
                </h1>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={onMenuClick} className="nb-shadow-sm" style={{
                    width: '2.5rem', height: '2.5rem',
                    padding: 0, borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    border: '2px solid var(--color-border)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <span className="material-symbols-outlined" style={{ fontWeight: 800 }}>menu</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
