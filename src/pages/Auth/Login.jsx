import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MobileContainer from '../../components/layout/MobileContainer';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth.jsx';
import { toast } from 'react-hot-toast';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAction = async () => {
        if (!email || !password) {
            toast.error(t('please_enter_email_password', 'Please enter both email and password'));
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (error) {
            if (error.status === 403 && error.email) {
                navigate('/verify', { state: { email: error.email } });
            } else {
                toast.error(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <MobileContainer>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-bg-surface)' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="nb-shadow-sm"
                    style={{
                        width: '2.75rem',
                        height: '2.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-bg-surface)',
                        border: 'var(--border-width) solid var(--color-border)',
                        cursor: 'pointer'
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontWeight: 900 }}>arrow_back</span>
                </button>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'uppercase' }}>{t('login')}</h2>
            </div>

            <main style={{ flex: 1, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-body)' }}>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem', color: 'var(--color-text-main)' }}>{t('email_address')}</label>
                    <input
                        className="nb-shadow-sm"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            width: '100%',
                            height: '3.5rem',
                            padding: '1rem 1.25rem',
                            borderRadius: 'var(--radius-md)',
                            border: 'var(--border-width) solid var(--color-border)',
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            backgroundColor: 'var(--color-bg-surface)',
                            color: 'var(--color-text-main)',
                            outline: 'none',
                        }}
                    />
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem', color: 'var(--color-text-main)' }}>{t('password')}</label>
                    <input
                        className="nb-shadow-sm"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%',
                            height: '3.5rem',
                            padding: '1rem 1.25rem',
                            borderRadius: 'var(--radius-md)',
                            border: 'var(--border-width) solid var(--color-border)',
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            backgroundColor: 'var(--color-bg-surface)',
                            color: 'var(--color-text-main)',
                            outline: 'none',
                        }}
                    />
                </div>

                <Button fullWidth onClick={handleAction} disabled={loading} style={{ height: '4rem', fontSize: '1.2rem', textTransform: 'uppercase' }}>
                    {loading ? t('logging_in') : t('login')}
                    <span className="material-symbols-outlined" style={{ marginLeft: '0.75rem', fontWeight: 900 }}>login</span>
                </Button>

                <div style={{ flex: 1 }}></div>

                <p style={{ textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {t('dont_have_account')} <button onClick={() => navigate('/register')} style={{ border: 'none', background: 'none', color: 'var(--color-primary)', fontWeight: 800, cursor: 'pointer', padding: 0 }}>{t('register_here')}</button>
                </p>

            </main>
        </MobileContainer>
    );
};

export default Login;
