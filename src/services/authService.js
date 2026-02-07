import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('truck_manager_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const authService = {
    async getProfile() {
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        return await response.json();
    },

    async updateProfile(updates) {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update profile');
        return data;
    },

    async changePassword(passwordData) {
        const response = await fetch(`${API_URL}/auth/change-password`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(passwordData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update password');
        return data;
    },

    // Note: Admin functions and Google Auth need separate backend implementations
    // For now, they are placeholders to prevent crashes
    async signInWithGoogle() {
        toast.error('Google Auth is not yet implemented for local backend. Please use Email/Password.');
    }
};
