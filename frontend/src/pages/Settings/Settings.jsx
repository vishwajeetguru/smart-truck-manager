import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { authService } from '../../services/authService';

const Settings = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('app_language', lng);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await authService.getProfile();
                setProfile(data);
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'var(--color-bg-body)' }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'var(--color-bg-surface)', borderBottom: '2px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 20 }}>
                <button onClick={() => navigate('/dashboard')} className="nb-shadow-sm" style={{
                    width: '3rem',
                    height: '3rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-surface)',
                    border: 'var(--border-width) solid var(--color-border)',
                    cursor: 'pointer'
                }}>
                    <span className="material-symbols-outlined" style={{ fontWeight: 900, fontSize: '1.75rem' }}>arrow_back</span>
                </button>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{t('settings')}</h2>
            </div>

            <main style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

                {/* Profile Section - Clickable */}
                <div
                    onClick={() => navigate('/edit-profile')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem',
                        padding: '1.25rem',
                        background: 'white',
                        borderRadius: 'var(--radius-lg)',
                        border: '2px solid black',
                        cursor: 'pointer',
                        transition: 'transform 0.1s'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <div className="nb-shadow-sm" style={{
                        width: '4.5rem',
                        height: '4.5rem',
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--color-accent)',
                        border: '2px solid black',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        {profile?.profile_picture ? (
                            <img src={profile.profile_picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
                                {loading ? '...' : getInitials(profile?.full_name)}
                            </h1>
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-main)', lineHeight: 1.1 }}>
                            {loading ? t('loading') : (profile?.full_name || t('user'))}
                        </h3>
                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                            {loading ? '...' : (profile?.mobile ? `${profile.country_code || '+91'} ${profile.mobile}` : t('no_mobile_added'))}
                        </p>
                    </div>
                    <span className="material-symbols-outlined" style={{ fontWeight: 900, color: 'var(--color-text-muted)' }}>chevron_right</span>
                </div>

                {/* Settings Card */}
                <Card noPadding style={{ overflow: 'hidden', border: '2px solid black', borderRadius: 'var(--radius-lg)' }} className="nb-shadow">
                    {/* Theme Toggle */}
                    <div style={{ padding: '1.25rem', borderBottom: '2px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid black' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.4rem', color: 'var(--color-warning)', fontWeight: 900 }}>dark_mode</span>
                            </div>
                            <span style={{ fontWeight: 900, fontSize: '1.125rem' }}>{t('dark_theme')}</span>
                        </div>
                        <div
                            onClick={toggleTheme}
                            className="nb-border"
                            style={{
                                width: '3.75rem', height: '2rem',
                                background: theme === 'dark' ? 'var(--color-primary)' : '#cbd5e1',
                                borderRadius: '2rem',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                border: '2px solid black'
                            }}>
                            <div style={{
                                width: '1.4rem', height: '1.4rem',
                                background: '#fff',
                                borderRadius: '50%',
                                border: '2px solid black',
                                position: 'absolute',
                                top: '0.15rem',
                                left: theme === 'dark' ? '2rem' : '0.2rem',
                                transition: 'all 0.3s'
                            }}></div>
                        </div>
                    </div>

                    {/* Language Selection */}
                    <div style={{ padding: '1.25rem', borderBottom: '2px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid black' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.4rem', color: 'var(--color-primary)', fontWeight: 900 }}>translate</span>
                            </div>
                            <span style={{ fontWeight: 900, fontSize: '1.125rem' }}>{t('language')}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {[
                                { code: 'en', label: t('english') },
                                { code: 'hi', label: t('hindi') },
                                { code: 'mr', label: t('marathi') }
                            ].map(lang => (
                                <button key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={i18n.language === lang.code ? 'nb-shadow-sm' : ''}
                                    style={{
                                        flex: 1,
                                        padding: '0.875rem 0.5rem',
                                        borderRadius: 'var(--radius-md)',
                                        background: i18n.language === lang.code ? 'var(--color-primary)' : 'white',
                                        color: i18n.language === lang.code ? '#fff' : 'var(--color-text-main)',
                                        border: '2px solid black',
                                        fontWeight: 900,
                                        fontSize: '0.8125rem',
                                        cursor: 'pointer',
                                        textTransform: 'uppercase',
                                        boxShadow: i18n.language === lang.code ? '2px 2px 0px black' : 'none'
                                    }}>
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Edit Profile Link */}
                    <div
                        onClick={() => navigate('/edit-profile')}
                        style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid black' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.4rem', color: 'var(--color-success)', fontWeight: 900 }}>edit</span>
                            </div>
                            <span style={{ fontWeight: 900, fontSize: '1.125rem' }}>{t('edit_profile')}</span>
                        </div>
                        <span className="material-symbols-outlined" style={{ fontWeight: 900, color: 'var(--color-text-muted)' }}>chevron_right</span>
                    </div>
                </Card>

                {/* Logout Button */}
                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                    <button
                        onClick={() => navigate('/')}
                        className="nb-shadow"
                        style={{
                            width: '100%',
                            padding: '1.5rem',
                            background: 'white',
                            color: 'var(--color-error)',
                            border: '3px solid black',
                            borderRadius: 'var(--radius-lg)',
                            fontWeight: 900,
                            fontSize: '1.25rem',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            boxShadow: '4px 4px 0px black'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontWeight: 900 }}>logout</span>
                        {t('logout')}
                    </button>

                    <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8125rem', fontWeight: 900, marginTop: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {t('version')} 1.2.4
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
