import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { toast } from 'react-hot-toast';

const SubscriptionGuard = ({ children }) => {
    const { profile, isTrialExpired, loading } = useAuth();

    if (loading) return null;

    if (profile && isTrialExpired()) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                backdropFilter: 'blur(10px)',
                padding: '2rem'
            }}>
                <Card style={{
                    maxWidth: '400px',
                    width: '100%',
                    textAlign: 'center',
                    padding: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                }} className="nb-shadow">
                    <div style={{
                        width: '4rem',
                        height: '4rem',
                        background: 'var(--color-error)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        color: '#fff'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '2.5rem' }}>lock</span>
                    </div>

                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Trial Expired</h2>
                        <p style={{ fontWeight: 600, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                            Your free trial has ended. Please subscribe to continue managing your trucks and trips seamlessly.
                        </p>
                    </div>

                    <div style={{
                        padding: '1.5rem',
                        background: 'var(--color-bg-body)',
                        borderRadius: 'var(--radius-md)',
                        border: '2px solid var(--color-border)',
                        boxShadow: '4px 4px 0 0 var(--color-border)'
                    }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Monthly Plan</p>
                        <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-primary)' }}>₹100 <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>/ month</span></p>
                    </div>

                    <Button
                        variant="primary"
                        size="lg"
                        style={{ width: '100%', height: '4rem', fontSize: '1.25rem' }}
                        onClick={() => toast('Payment Integration Coming Soon! 💳')}
                    >
                        Subscribe Now
                    </Button>

                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Trusted by 1000+ Truck Owners
                    </p>
                </Card>
            </div>
        );
    }

    return children;
};

export default SubscriptionGuard;
