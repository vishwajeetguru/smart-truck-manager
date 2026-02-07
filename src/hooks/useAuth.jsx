import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('truck_manager_token');
            if (token) {
                try {
                    const response = await fetch(`${API_URL}/auth/profile`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const profileData = await response.json();
                        setUser(profileData);
                    } else {
                        localStorage.removeItem('truck_manager_token');
                        setUser(null);
                    }
                } catch (err) {
                    console.error('Auth init error:', err);
                    localStorage.removeItem('truck_manager_token');
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (!response.ok) {
            // Special handling for unverified users
            if (response.status === 403 && data.email) {
                const error = new Error(data.message);
                error.email = data.email;
                error.status = 403;
                throw error;
            }
            throw new Error(data.message || 'Login failed');
        }

        localStorage.setItem('truck_manager_token', data.token);
        setUser(data.user);
        return data.user;
    };

    const register = async (userData) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Registration failed');

        return data; // Return message and email for next step
    };

    const sendOTP = async (email, method) => {
        const response = await fetch(`${API_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, method })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send code');
        return data;
    };

    const verifyOTP = async (email, code) => {
        const response = await fetch(`${API_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Verification failed');

        localStorage.setItem('truck_manager_token', data.token);
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('truck_manager_token');
        setUser(null);
    };

    const isAdmin = () => user?.role === 'admin';
    const isBlocked = () => user?.is_blocked === true;
    const isVerified = () => user?.is_verified === true;
    const isTrialExpired = () => {
        if (!user) return false;
        if (!user.trial_expires_at) return true;
        return new Date(user.trial_expires_at) < new Date();
    };

    return (
        <AuthContext.Provider value={{ user, profile: user, loading, login, logout, register, sendOTP, verifyOTP, isAdmin, isBlocked, isTrialExpired, isVerified }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
