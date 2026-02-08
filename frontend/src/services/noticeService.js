const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('truck_manager_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const noticeService = {
    async getMyNotices() {
        const response = await fetch(`${API_URL}/notices`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch notices');
        return await response.json();
    },

    async createNotice(noticeData) {
        const response = await fetch(`${API_URL}/notices`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(noticeData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create notice');
        return data;
    },

    async deleteNotice(noticeId) {
        const response = await fetch(`${API_URL}/notices/${noticeId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete notice');
        return true;
    }
};
