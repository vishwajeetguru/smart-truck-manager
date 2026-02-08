import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MobileContainer from '../../components/layout/MobileContainer';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-hot-toast';

import { authService } from '../../services/authService';

const Welcome = () => {
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('app_language', lng);
    };

    const handleGoogleAuth = async () => {
        try {
            await authService.signInWithGoogle();
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <MobileContainer>
            {/* Top Bar / Language Switcher */}
            <header style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid var(--color-border)',
                background: 'var(--color-bg-surface)',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                {/* Logo Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="nb-shadow-sm" style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        background: 'var(--color-primary)',
                        border: '2px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: '#fff'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', fontWeight: 900 }}>local_shipping</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="nb-shadow-sm"
                        style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--color-bg-surface)',
                            color: 'var(--color-text-main)',
                            cursor: 'pointer',
                            transition: 'all 0.1s'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontWeight: 900, fontSize: '1.25rem' }}>
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>

                    {/* Language Switcher */}
                    <div style={{
                        display: 'flex',
                        background: 'var(--color-bg-surface)',
                        padding: '0.25rem',
                        border: '2px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        gap: '0.25rem'
                    }}>
                        {[
                            { code: 'en', label: 'EN' },
                            { code: 'hi', label: 'हिंदी' },
                            { code: 'mr', label: 'मराठी' }
                        ].map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                style={{
                                    padding: '0.4rem 0.6rem',
                                    background: i18n.language === lang.code ? 'var(--color-primary)' : 'transparent',
                                    color: i18n.language === lang.code ? '#fff' : 'var(--color-text-main)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: 'none',
                                    fontWeight: 900,
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textTransform: 'uppercase'
                                }}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{
                flex: 1,
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center'
            }}>
                {/* Illustration Placeholder */}
                <div style={{
                    width: '100%',
                    maxWidth: '320px',
                    aspectRatio: '1/1',
                    background: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBJEwRCUrKpyk97gTKIhKCCfwni0PLwk1U02RcQkBEHToBVLZCuVW67zvZxxewD1x1XwgY3Nku97vQWrYtHfHOHbL7Dnc16AGB6zZdx5w0hcqGJlQ6OSXFmCEg5daFYVh11yJK3f8cKu5z8J6T0a815WCd_RLWu8If7LI-Hg1PfBn7o636awY9dn-neWxNFD0yS1ZvQivs2Vgb8Hjb4J61gJY2R__JsfPxkp6Zqjp1VwAuzl6uUd38JIx9FljGR5qkIB5wHVqa4nM8) center/cover',
                    borderRadius: '1rem',
                    border: '2px solid var(--color-border)',
                    boxShadow: 'var(--shadow-offset) var(--shadow-offset) 0px 0px var(--color-border)',
                    marginBottom: '2rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(19, 127, 236, 0.1)', mixBlendMode: 'multiply' }}></div>
                </div>

                <h1 style={{
                    fontSize: '2.25rem',
                    lineHeight: '1.2',
                    fontWeight: 800,
                    marginBottom: '1rem',
                    letterSpacing: '-0.02em'
                }}>
                    Smart Truck & <br />
                    <span style={{ color: 'var(--color-primary)' }}>{t('welcome_title_payment')}</span>
                </h1>

                <p style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '1.125rem',
                    fontWeight: 500,
                    marginBottom: '2.5rem',
                    maxWidth: '300px'
                }}>
                    {t('homepage_subtext')}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '320px' }}>
                    <Button fullWidth onClick={() => navigate('/register')}>{t('register')}</Button>
                    <Button fullWidth variant="secondary" onClick={() => navigate('/login')}>{t('login')}</Button>

                    <div style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, height: '2px', background: 'var(--color-border)', opacity: 0.2 }}></div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{t('or')}</span>
                        <div style={{ flex: 1, height: '2px', background: 'var(--color-border)', opacity: 0.2 }}></div>
                    </div>

                    <button className="nb-shadow" onClick={handleGoogleAuth} style={{
                        width: '100%',
                        height: '3.5rem',
                        background: 'var(--color-bg-surface)',
                        border: 'var(--border-width) solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        fontWeight: 800,
                        fontSize: '1rem',
                        cursor: 'pointer'
                    }}>
                        <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '1.25rem', height: '1.25rem' }} />
                        {t('continue_with_google')}
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ padding: '1.5rem', textAlign: 'center' }}>
                <p style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--color-text-muted)'
                }}>
                    {t('trusted_by')}
                </p>
            </footer>
        </MobileContainer>
    );
};

export default Welcome;
