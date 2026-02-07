import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/ui/Card';
import { driverService } from '../../services/driverService';

const DriverList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const data = await driverService.getMyDrivers();
            setDrivers(data);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCall = (e, phone) => {
        e.stopPropagation();
        window.location.href = `tel:${phone}`;
    };

    // Get initials from name
    const getInitials = (name) => {
        if (!name) return 'D';
        const names = name.split(' ');
        if (names.length >= 2) {
            return names[0][0] + names[1][0];
        }
        return names[0][0];
    };

    // Generate random color for avatar
    const getAvatarColor = (index) => {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        return colors[index % colors.length];
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg-body)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        border: '4px solid var(--color-primary)',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        margin: '0 auto 1rem',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ fontWeight: 800, color: 'var(--color-text-main)' }}>{t('loading_drivers')}</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-body)' }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-bg-surface)' }}>
                <button onClick={() => navigate('/dashboard')} className="nb-shadow-sm" style={{
                    width: '2.75rem',
                    height: '2.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-surface)',
                    border: 'var(--border-width) solid var(--color-border)',
                    cursor: 'pointer'
                }}>
                    <span className="material-symbols-outlined" style={{ fontWeight: 900 }}>arrow_back</span>
                </button>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'uppercase' }}>{t('drivers')}</h2>
            </div>

            <main style={{ flex: 1, padding: '1.25rem', overflowY: 'auto' }}>
                {/* Driver List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {drivers.map((driver, index) => (
                        <Card
                            key={driver.id}
                            onClick={() => navigate(`/driver-details/${driver.id}`)}
                            className="nb-shadow"
                            style={{ padding: '1.25rem', cursor: 'pointer', background: 'var(--color-bg-surface)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                {/* Avatar */}
                                {driver.photo_url ? (
                                    <div className="nb-border" style={{
                                        width: '4rem',
                                        height: '4rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '2px solid var(--color-border)',
                                        overflow: 'hidden',
                                        flexShrink: 0
                                    }}>
                                        <img
                                            src={driver.photo_url}
                                            alt={driver.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                ) : (
                                    <div className="nb-border" style={{
                                        width: '4rem',
                                        height: '4rem',
                                        borderRadius: 'var(--radius-md)',
                                        background: getAvatarColor(index),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        fontSize: '1.5rem',
                                        fontWeight: 900,
                                        flexShrink: 0
                                    }}>
                                        {getInitials(driver.name)}
                                    </div>
                                )}

                                {/* Driver Info */}
                                <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                                    <h3 style={{
                                        fontSize: '1.15rem',
                                        fontWeight: 900,
                                        color: 'var(--color-text-main)',
                                        marginBottom: '0.6rem',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {driver.name}
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                padding: '0.2rem',
                                                borderRadius: '0.25rem',
                                                display: 'flex'
                                            }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 900 }}>badge</span>
                                            </div>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>
                                                {driver.license_number || t('no_license')}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{
                                                background: 'rgba(34, 197, 94, 0.1)',
                                                padding: '0.2rem',
                                                borderRadius: '0.25rem',
                                                display: 'flex'
                                            }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: 'var(--color-success)', fontWeight: 900 }}>payments</span>
                                            </div>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                                                {t('salary')}: <span style={{ color: 'var(--color-success)' }}>₹{driver.salary?.toLocaleString() || 0}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Column */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
                                    <button
                                        onClick={(e) => handleCall(e, driver.mobile_primary)}
                                        className="nb-shadow-sm"
                                        style={{
                                            width: '3rem',
                                            height: '3rem',
                                            borderRadius: 'var(--radius-lg)',
                                            background: 'var(--color-success)',
                                            color: '#fff',
                                            border: 'var(--border-width) solid var(--color-border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'transform 0.1s'
                                        }}
                                        onMouseDown={(e) => e.currentTarget.style.transform = 'translate(1px, 1px)'}
                                        onMouseUp={(e) => e.currentTarget.style.transform = 'translate(0, 0)'}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontWeight: 900, fontSize: '1.5rem', fontVariationSettings: "'FILL' 1" }}>call</span>
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/edit-driver/${driver.id}`);
                                        }}
                                        className="nb-shadow-sm"
                                        style={{
                                            width: '2.5rem',
                                            height: '2.5rem',
                                            background: 'var(--color-bg-surface)',
                                            border: '2px solid var(--color-border)',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--color-primary)', fontWeight: 900 }}>edit</span>
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {drivers.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '4rem 2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1.5rem'
                        }}>
                            <div className="nb-shadow" style={{
                                width: '8rem',
                                height: '8rem',
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--color-bg-surface)',
                                border: '3px solid var(--color-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span className="material-symbols-outlined" style={{
                                    fontSize: '5rem',
                                    color: 'var(--color-text-muted)',
                                    opacity: 0.3
                                }}>person</span>
                            </div>
                            <div>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    marginBottom: '0.5rem',
                                    color: 'var(--color-text-main)'
                                }}>{t('no_drivers')}</h3>
                                <p style={{
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    color: 'var(--color-text-muted)',
                                    lineHeight: 1.5
                                }}>
                                    {t('add_first_driver')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ height: '6rem' }}></div>
            </main>

            {/* Floating Action Button */}
            <button
                onClick={() => navigate('/add-driver')}
                className="nb-shadow"
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '1.5rem',
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '1.25rem',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    border: '3px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10
                }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', fontWeight: 900 }}>add</span>
            </button>
        </div>
    );
};

export default DriverList;
