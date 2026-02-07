import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MobileContainer from '../../components/layout/MobileContainer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth.jsx';
import { toast } from 'react-hot-toast';

const Register = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { sendOTP } = useAuth();
    const [method, setMethod] = useState('email'); // 'mobile' or 'email'
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGetOTP = async () => {
        const identifier = method === 'email' ? email : mobile;
        if (!identifier) {
            toast.error(t('please_enter_valid_amount', `Please enter a valid ${method}`));
            return;
        }

        setLoading(true);
        try {
            await sendOTP(identifier, method);
            navigate('/verify', { state: { email: identifier, method } });
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MobileContainer>
            <main style={{
                flex: 1,
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--color-bg-body)'
            }}>
                {/* Heading & Image */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div className="nb-shadow" style={{
                        width: '100%',
                        height: '180px',
                        background: 'white',
                        borderRadius: 'var(--radius-lg)',
                        border: '3px solid black',
                        overflow: 'hidden',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <img
                            src="/truck_registration_welcome.png"
                            alt="Welcome"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        lineHeight: 1,
                        color: 'var(--color-text-main)',
                        WebkitTextStroke: '1.5px black',
                        textShadow: '4px 4px 0px var(--color-primary)',
                        marginBottom: '1.5rem'
                    }}>
                        {t('registration')}
                    </h1>
                </div>

                {/* Method Switcher */}
                <div className="nb-border nb-shadow" style={{
                    display: 'flex',
                    background: 'white',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.25rem',
                    marginBottom: '2.5rem'
                }}>
                    <button
                        onClick={() => setMethod('mobile')}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: 'none',
                            borderRadius: 'calc(var(--radius-md) - 0.25rem)',
                            fontSize: '0.875rem',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            background: method === 'mobile' ? 'var(--color-primary)' : 'transparent',
                            color: method === 'mobile' ? 'white' : 'var(--color-text-muted)',
                            transition: 'all 0.2s ease',
                            boxShadow: method === 'mobile' ? 'var(--neubrutalism-shadow-sm)' : 'none',
                            border: method === 'mobile' ? '2px solid black' : 'none'
                        }}
                    >
                        {t('mobile')}
                    </button>
                    <button
                        onClick={() => setMethod('email')}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: 'none',
                            borderRadius: 'calc(var(--radius-md) - 0.25rem)',
                            fontSize: '0.875rem',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            background: method === 'email' ? 'var(--color-primary)' : 'transparent',
                            color: method === 'email' ? 'white' : 'var(--color-text-muted)',
                            transition: 'all 0.2s ease',
                            boxShadow: method === 'email' ? 'var(--neubrutalism-shadow-sm)' : 'none',
                            border: method === 'email' ? '2px solid black' : 'none'
                        }}
                    >
                        {t('email')}
                    </button>
                </div>

                {/* Input Section */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        marginBottom: '0.75rem',
                        color: 'var(--color-text-main)'
                    }}>
                        {method === 'email' ? t('enter_email_address') : t('enter_mobile_number')}
                    </label>

                    {method === 'email' ? (
                        <div className="nb-shadow" style={{ borderRadius: 'var(--radius-md)' }}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="supplier@example.com"
                                style={{
                                    width: '100%',
                                    padding: '1.25rem',
                                    fontSize: '1.125rem',
                                    fontWeight: 700,
                                    borderRadius: 'var(--radius-md)',
                                    border: '3px solid black',
                                    outline: 'none',
                                    background: 'white'
                                }}
                            />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <div className="nb-shadow" style={{
                                width: '6rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '1rem',
                                background: 'white',
                                borderRadius: 'var(--radius-md)',
                                border: '3px solid black',
                                fontWeight: 900
                            }}>
                                <span style={{ fontSize: '1.25rem' }}>🇮🇳</span>
                                <span>+91</span>
                            </div>
                            <div className="nb-shadow" style={{ flex: 1, borderRadius: 'var(--radius-md)' }}>
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="98765 43210"
                                    style={{
                                        width: '100%',
                                        padding: '1.25rem',
                                        fontSize: '1.125rem',
                                        fontWeight: 700,
                                        borderRadius: 'var(--radius-md)',
                                        border: '3px solid black',
                                        outline: 'none',
                                        background: 'white'
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <button
                    disabled={loading}
                    onClick={handleGetOTP}
                    className="nb-shadow"
                    style={{
                        width: '100%',
                        padding: '1.25rem',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: '3px solid black',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        marginBottom: '2rem'
                    }}
                >
                    {loading ? t('sending') : (
                        <>
                            {method === 'email' ? t('get_verification_link') : t('get_otp')}
                            <span className="material-symbols-outlined" style={{ fontWeight: 900 }}>
                                {method === 'email' ? 'send' : 'arrow_forward'}
                            </span>
                        </>
                    )}
                </button>

                {/* Footer Links */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '3rem' }}>
                        {t('already_have_account')} {' '}
                        <span
                            onClick={() => navigate('/login')}
                            style={{ color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                            {t('login_here')}
                        </span>
                    </p>

                    <p style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        lineHeight: 1.5
                    }}>
                        {t('agree_terms')} <span style={{ textDecoration: 'underline' }}>{t('terms_service')}</span> {t('or', 'and')} <br />
                        <span style={{ textDecoration: 'underline' }}>{t('privacy_policy')}</span>.
                    </p>
                </div>

            </main>
        </MobileContainer >
    );
};

export default Register;
