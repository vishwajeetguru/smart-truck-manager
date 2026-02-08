import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileContainer from '../../components/layout/MobileContainer';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth.jsx';
import { toast } from 'react-hot-toast';

const VerifyOTP = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOTP } = useAuth();

    // Get email from state or query params
    const queryParams = new URLSearchParams(location.search);
    const email = location.state?.email || queryParams.get('email');
    const directCode = queryParams.get('code');

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);

    // If there's a direct code in the URL, verify it immediately
    useEffect(() => {
        if (directCode && email) {
            handleDirectVerify(directCode);
        }
    }, [directCode, email]);

    const handleDirectVerify = async (code) => {
        setLoading(true);
        try {
            await verifyOTP(email, code);
            navigate('/profile-setup');
        } catch (error) {
            toast.error('Automatic verification failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Focus next input
        if (element.nextSibling && element.value !== '') {
            element.nextSibling.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length === 6) {
            setLoading(true);
            try {
                await verifyOTP(email, otpCode);
                navigate('/profile-setup');
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        } else {
            toast.error('Please enter a valid 6-digit OTP');
        }
    };

    if (!email) {
        return (
            <MobileContainer>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2>Invalid Verification Request</h2>
                    <Button onClick={() => navigate('/login')}>Go to Login</Button>
                </div>
            </MobileContainer>
        );
    }

    return (
        <MobileContainer>
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-bg-surface)' }}>
                <button
                    onClick={() => navigate('/login')}
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
                    <span className="material-symbols-outlined" style={{ fontWeight: 900 }}>close</span>
                </button>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'uppercase' }}>Verify</h2>
            </div>

            <main style={{ flex: 1, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-body)' }}>

                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1, marginBottom: '0.75rem' }}>
                        Check <br />
                        <span style={{ color: 'var(--color-primary)' }}>Email</span>
                    </h1>
                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                        We've sent a 6-digit code to <br />
                        <span style={{ color: 'var(--color-text-main)', fontWeight: 900 }}>{email}</span>
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', justifyContent: 'space-between' }}>
                    {otp.map((data, index) => (
                        <input
                            key={index}
                            className="nb-shadow-sm"
                            type="text"
                            maxLength="1"
                            value={data}
                            onChange={e => handleChange(e.target, index)}
                            onFocus={e => e.target.select()}
                            style={{
                                width: '14%',
                                height: '4rem',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1.75rem',
                                fontWeight: 900,
                                textAlign: 'center',
                                backgroundColor: 'var(--color-bg-surface)',
                                color: 'var(--color-text-main)',
                                border: 'var(--border-width) solid var(--color-border)',
                                outline: 'none',
                            }}
                        />
                    ))}
                </div>

                <Button fullWidth onClick={handleVerify} disabled={loading} style={{ height: '4rem', fontSize: '1.25rem', textTransform: 'uppercase' }}>
                    {loading ? 'Verifying...' : 'Verify Email'}
                    <span className="material-symbols-outlined" style={{ marginLeft: '0.75rem', fontWeight: 900 }}>check_circle</span>
                </Button>

                <div style={{ flex: 1 }}></div>

                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                        Didn't receive the code?
                    </p>
                    <button style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        fontWeight: 900,
                        fontSize: '1rem',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        padding: '0.5rem 1rem',
                        borderBottom: '2px solid var(--color-primary)'
                    }}>Resend Code</button>
                </div>

            </main>
        </MobileContainer>
    );
};

export default VerifyOTP;
