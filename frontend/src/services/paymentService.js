const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('truck_manager_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const paymentService = {
    async getTripPayments(tripId) {
        const response = await fetch(`${API_URL}/payments/trip/${tripId}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch payments');
        return await response.json();
    },

    async addPayment(paymentData) {
        const response = await fetch(`${API_URL}/payments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(paymentData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to add payment');
        return data;
    },

    async getMyPayments() {
        const response = await fetch(`${API_URL}/payments`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch payments');
        return await response.json();
    }
};
