import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

const ProtectedRoute = ({ children }) => {
    const { user, loading, isTrialExpired, isBlocked, isAdmin } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-bg-body)',
                color: 'var(--color-primary)',
                fontSize: '1.5rem',
                fontWeight: 900
            }}>
                LOADING...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (isBlocked()) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-bg-body)',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '3rem', color: 'var(--color-error)' }}>BLOCKED</h1>
                <p style={{ fontWeight: 700, marginTop: '1rem' }}>Your account has been blocked by the admin. Please contact support.</p>
            </div>
        );
    }

    if (isTrialExpired() && !isAdmin()) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-bg-body)',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>TRIAL EXPIRED</h1>
                <p style={{ fontWeight: 700, marginTop: '1rem', marginBottom: '2rem' }}>Your 1 month free trial has ended. Please subscribe to continue using the platform.</p>
                <button className="nb-button" style={{ padding: '1rem 2rem' }}>UPGRADE TO PREMIUM</button>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
