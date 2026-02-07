import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.jsx';

const Sidebar = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const menuItems = [
        { label: t('dashboard'), icon: 'dashboard', path: '/dashboard' },
        { label: t('my_trips'), icon: 'local_shipping', path: '/trips' },
        { label: t('payments'), icon: 'payments', path: '/payments' },
        { label: t('drivers'), icon: 'person', path: '/drivers' },
        { label: t('fuel_logs'), icon: 'local_gas_station', path: '/fuel-expenses' },
        { label: t('petrol_pumps'), icon: 'ev_station', path: '/petrol-pumps' },
        { label: t('suppliers'), icon: 'inventory_2', path: '/suppliers' },
        { label: t('materials'), icon: 'inventory', path: '/materials' },
        { label: t('truck_expenses'), icon: 'build', path: '/expenses' },
        { label: t('reminders'), icon: 'notifications_active', path: '/add-reminder' },
        { label: t('settings'), icon: 'settings', path: '/settings' },
    ];

    const handleNavigate = (path) => {
        navigate(path);
        onClose();
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        onClose();
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.full_name) return 'U';
        const names = user.full_name.split(' ');
        if (names.length >= 2) {
            return names[0][0] + names[1][0];
        }
        return names[0][0];
    };

    // Format phone number with country code
    const getFormattedPhone = () => {
        if (!user?.mobile) return '';
        const countryCode = user?.country_code || '+91';
        return `${countryCode} ${user.mobile}`;
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1000,
                        transition: 'opacity 0.3s'
                    }}
                />
            )}

            {/* Sidebar Shell */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: isOpen ? 0 : '-100%',
                width: '80%',
                maxWidth: '320px',
                height: '100%',
                backgroundColor: 'var(--color-bg-surface)',
                borderLeft: 'var(--border-width) solid var(--color-border)',
                zIndex: 1001,
                transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                padding: '1.5rem',
                boxShadow: '-8px 0 0 0 rgba(0,0,0,0.1)'
            }}>
                {/* User Profile Section */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    paddingBottom: '1.5rem',
                    marginBottom: '1.5rem',
                    borderBottom: '2px dashed var(--color-border)'
                }}>
                    <div className="nb-border" style={{
                        width: '3.5rem',
                        height: '3.5rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '1.25rem',
                        fontWeight: 900
                    }}>
                        {getUserInitials()}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>{user?.full_name || 'User'}</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                            {getFormattedPhone() || user?.email}
                        </p>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    overflowY: 'auto',
                    paddingRight: '4px',
                    marginRight: '-4px'
                }}>
                    {menuItems.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleNavigate(item.path)}
                            className="nb-border"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--color-bg-surface)',
                                cursor: 'pointer',
                                transition: 'transform 0.1s',
                                fontWeight: 700
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translate(-2px, -2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                        >
                            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>{item.icon}</span>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </nav>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="nb-button"
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'var(--color-error)',
                        color: '#fff',
                        marginTop: '1.5rem'
                    }}
                >
                    <span className="material-symbols-outlined" style={{ marginRight: '0.5rem' }}>logout</span>
                    {t('logout_simple')}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    Smart Truck Manager {t('version')} 1.0
                </div>
            </div>
        </>
    );
};

export default Sidebar;
