import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authService } from '../../services/authService';
import { truckService } from '../../services/truckService';
import { useAuth } from '../../hooks/useAuth.jsx';
import { toast } from 'react-hot-toast';

const EditProfile = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [trucks, setTrucks] = useState([]);
    const [hasPassword, setHasPassword] = useState(false);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        full_name: '',
        mobile: '',
        mobile_secondary: '',
        country_code: '+91',
        profile_picture: ''
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [profile, trucksData] = await Promise.all([
                    authService.getProfile(),
                    truckService.getMyTrucks()
                ]);

                setFormData({
                    full_name: profile.full_name || '',
                    mobile: profile.mobile || '',
                    mobile_secondary: profile.mobile_secondary || '',
                    country_code: profile.country_code || '+91',
                    profile_picture: profile.profile_picture || ''
                });
                setTrucks(trucksData || []);
                setHasPassword(profile.has_password);
            } catch (err) {
                console.error('Error loading profile:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image size should be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profile_picture: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!formData.full_name || !formData.mobile) {
            toast.error('Name and Mobile Number are required');
            return;
        }

        setSaving(true);
        try {
            const updatePayload = { ...formData };

            // 1. Add password fields to payload if shown and filled
            if (showPasswordFields && passwordData.new_password) {
                if (passwordData.new_password !== passwordData.confirm_password) {
                    throw new Error('New passwords do not match');
                }
                updatePayload.current_password = passwordData.current_password;
                updatePayload.new_password = passwordData.new_password;
            }

            // 2. Perform Single Combined Update
            const updatedProfile = await authService.updateProfile(updatePayload);

            setFormData(prev => ({
                ...prev,
                profile_picture: updatedProfile.profile_picture || ''
            }));

            toast.success('Profile updated successfully');
            navigate('/settings');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg-body)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '3.5rem',
                        height: '3.5rem',
                        border: '5px solid var(--color-primary)',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        margin: '0 auto 1.5rem',
                        animation: 'spin 1.2s linear infinite'
                    }}></div>
                    <p style={{ fontWeight: 900, color: 'var(--color-text-main)', fontSize: '1.125rem' }}>{t('loading_details')}</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-body)' }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'var(--color-bg-surface)', borderBottom: '2px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 20 }}>
                <button onClick={() => navigate('/settings')} className="nb-shadow-sm" style={{
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
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{t('edit_profile')}</h2>
            </div>

            <main style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Profile Picture Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div
                        onClick={() => fileInputRef.current.click()}
                        style={{
                            width: '8rem',
                            height: '8rem',
                            borderRadius: 'var(--radius-lg)',
                            border: '3px solid black',
                            background: 'white',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            position: 'relative',
                            boxShadow: '4px 4px 0px black'
                        }}
                    >
                        {formData.profile_picture ? (
                            <img src={formData.profile_picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-accent)' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '3.5rem', color: 'white' }}>person</span>
                            </div>
                        )}
                        <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.4rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.05em' }}>
                            {t('change', 'CHANGE')}
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                        accept="image/*"
                    />
                </div>

                {/* Profile Form */}
                <div className="nb-shadow" style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '2px solid black' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                        <Input
                            label={t('full_name')}
                            placeholder="Ankush Dongre"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 900, fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--color-text-main)' }}>{t('mobile', 'Mobile Number')}</label>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <div className="nb-border" style={{
                                    width: '4.5rem',
                                    height: '3.625rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#f8fafc',
                                    border: '2px solid black',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: 900,
                                    fontSize: '1rem',
                                    boxShadow: '2px 2px 0px black'
                                }}>
                                    {formData.country_code}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Input
                                        placeholder="9876543210"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        type="tel"
                                        fullWidth
                                    />
                                </div>
                            </div>
                        </div>

                        <Input
                            label={t('secondary_mobile', 'Secondary Mobile (Optional)')}
                            placeholder="7744558899"
                            name="mobile_secondary"
                            value={formData.mobile_secondary}
                            onChange={handleChange}
                            type="tel"
                        />
                    </div>
                </div>

                {/* Password Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div
                        onClick={() => setShowPasswordFields(!showPasswordFields)}
                        className="nb-border"
                        style={{
                            padding: '1.25rem',
                            background: 'white',
                            borderRadius: 'var(--radius-md)',
                            border: '2px solid black',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            boxShadow: '4px 4px 0px black'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(37, 99, 235, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid black' }}>
                                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontWeight: 900, fontSize: '1.25rem' }}>lock</span>
                            </div>
                            <span style={{ fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase' }}>
                                {hasPassword ? t('change_password', 'Change Password') : t('create_password', 'Create Password')}
                            </span>
                        </div>
                        <span className="material-symbols-outlined" style={{ fontWeight: 900, transform: showPasswordFields ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                            expand_more
                        </span>
                    </div>

                    {showPasswordFields && (
                        <div className="nb-shadow" style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '2px solid black', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {hasPassword && (
                                <Input
                                    label={t('current_password', 'Current Password')}
                                    placeholder="••••••••"
                                    name="current_password"
                                    value={passwordData.current_password}
                                    onChange={handlePasswordChange}
                                    type="password"
                                />
                            )}
                            <Input
                                label={t('new_password', 'New Password')}
                                placeholder="••••••••"
                                name="new_password"
                                value={passwordData.new_password}
                                onChange={handlePasswordChange}
                                type="password"
                            />
                            <Input
                                label={t('confirm_password', 'Confirm Password')}
                                placeholder="••••••••"
                                name="confirm_password"
                                value={passwordData.confirm_password}
                                onChange={handlePasswordChange}
                                type="password"
                            />
                        </div>
                    )}
                </div>

                {/* Trucks Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase' }}>{t('my_trucks', 'My Trucks')}</h3>
                        <button
                            onClick={() => navigate('/truck-setup', { state: { truckCount: 1, fromSettings: true } })}
                            style={{
                                background: 'white',
                                color: 'var(--color-primary)',
                                border: '2px solid black',
                                padding: '0.75rem 1.25rem',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: 900,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                boxShadow: '3px 3px 0px black',
                                textTransform: 'uppercase'
                            }}
                        >
                            + {t('add_truck', 'Add Truck')}
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {trucks.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '2rem', border: '2px dashed #cbd5e1', borderRadius: 'var(--radius-md)', fontWeight: 700, color: '#64748b' }}>
                                No trucks added yet.
                            </p>
                        ) : (
                            trucks.map((truck) => (
                                <div key={truck.id} className="nb-border" style={{
                                    padding: '1.25rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'white',
                                    border: '2px solid black',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.25rem',
                                    boxShadow: '3px 3px 0px black'
                                }}>
                                    <div style={{
                                        width: '3rem',
                                        height: '3rem',
                                        borderRadius: '50%',
                                        background: 'rgba(37, 99, 235, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--color-primary)',
                                        border: '1.5px solid black'
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', fontWeight: 900 }}>local_shipping</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 900, fontSize: '1.125rem' }}>{truck.truck_number}</p>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{truck.model || 'Diesel'}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div style={{ marginTop: '2rem', paddingBottom: '3rem' }}>
                    <Button
                        fullWidth
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            width: '100%',
                            height: '4.5rem',
                            fontSize: '1.5rem',
                            textTransform: 'uppercase',
                            fontWeight: 900,
                            letterSpacing: '0.05em',
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: '3px solid black',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: '6px 6px 0px black',
                            cursor: 'pointer',
                            padding: 0
                        }}
                    >
                        {saving ? t('saving') : t('update_profile', 'Update Profile')}
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default EditProfile;
