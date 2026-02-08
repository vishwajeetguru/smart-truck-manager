import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MobileContainer from '../../components/layout/MobileContainer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { truckService } from '../../services/truckService';
import Select from '../../components/ui/Select';
import { useAuth } from '../../hooks/useAuth.jsx';
import { authService } from '../../services/authService';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-hot-toast';

const ProfileSetup = () => {
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const mobileValue = location.state?.mobile || user?.mobile || '';

    const [formData, setFormData] = useState({
        name: user?.full_name || '',
        address: '',
        countryCode: '+91',
        mobilePrimary: mobileValue,
        mobileSecondary: '',
        truckCount: '1'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (formData.name && formData.address && formData.mobilePrimary) {
            try {
                await authService.updateProfile({
                    full_name: formData.name,
                    mobile: formData.mobilePrimary,
                    mobile_secondary: formData.mobileSecondary,
                    country_code: formData.countryCode
                });

                navigate('/truck-setup', { state: { truckCount: parseInt(formData.truckCount) } });
            } catch (error) {
                toast.error(error.message);
            }
        } else {
            toast.error('Please fill all required fields');
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('app_language', lng);
    };

    const countryCodes = [
        { value: '+91', label: '+91 (India)' },
        { value: '+1', label: '+1 (USA/Canada)' },
        { value: '+44', label: '+44 (UK)' },
        { value: '+971', label: '+971 (UAE)' },
        { value: '+65', label: '+65 (Singapore)' },
        { value: '+61', label: '+61 (Australia)' },
    ];

    return (
        <main style={{ flex: 1, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Progress */}
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Onboarding</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>Step 3 of 4</span>
                </div>
                <div className="nb-border" style={{ height: '0.875rem', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-surface)', overflow: 'hidden', padding: '2px' }}>
                    <div style={{ width: '75%', height: '100%', background: 'var(--color-primary)', borderRadius: 'var(--radius-full)' }}></div>
                </div>
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--color-text-main)' }}>
                    Tell us about <br /> <span style={{ color: 'var(--color-primary)' }}>Your Business</span>
                </h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <Input
                    label="Your Name"
                    placeholder="e.g. Rajesh Kumar"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                />

                <Input
                    label="Address / City"
                    placeholder="e.g. Pune, Maharashtra"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                />

                {/* Primary Mobile Number */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div className="nb-shadow-sm" style={{
                        width: '5rem',
                        height: '3.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--color-bg-surface)',
                        border: 'var(--border-width) solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 900,
                        fontSize: '1rem'
                    }}>
                        +91
                    </div>
                    <div style={{ flex: 1 }}>
                        <Input
                            label="Mobile Number (Primary)"
                            placeholder="e.g. 9876543210"
                            name="mobilePrimary"
                            value={formData.mobilePrimary}
                            onChange={handleChange}
                            type="tel"
                        />
                    </div>
                </div>

                {/* Secondary Mobile Number */}
                <Input
                    label="Mobile Number (Secondary - Optional)"
                    placeholder="e.g. 9123456789"
                    name="mobileSecondary"
                    value={formData.mobileSecondary}
                    onChange={handleChange}
                    type="tel"
                />

                <Select
                    label="Number of trucks"
                    name="truckCount"
                    value={formData.truckCount}
                    onChange={handleChange}
                    options={[
                        ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => ({ value: num, label: num })),
                        { value: '11', label: '10+' }
                    ]}
                />
            </div>

            <div style={{ marginTop: '2rem' }}>
                <Button
                    fullWidth
                    onClick={handleSave}
                    style={{
                        height: '4rem',
                        fontSize: '1.25rem',
                        textTransform: 'uppercase',
                        fontWeight: 900,
                        letterSpacing: '0.05em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    Save & Continue
                </Button>
            </div>

        </main>
    );
};

export default ProfileSetup;
