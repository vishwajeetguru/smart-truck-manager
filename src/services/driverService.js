const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('truck_manager_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const driverService = {
    async getMyDrivers() {
        const response = await fetch(`${API_URL}/drivers`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch drivers');
        return await response.json();
    },

    async getDriver(id) {
        const response = await fetch(`${API_URL}/drivers/${id}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch driver details');
        return await response.json();
    },

    async addDriver(driverData) {
        const response = await fetch(`${API_URL}/drivers`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(driverData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to add driver');
        return data;
    },

    async updateDriver(id, driverData) {
        const response = await fetch(`${API_URL}/drivers/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(driverData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update driver');
        return data;
    },

    async deleteDriver(id) {
        const response = await fetch(`${API_URL}/drivers/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete driver');
        return data;
    },

    async getDriverPayments(id) {
        const response = await fetch(`${API_URL}/drivers/${id}/payments`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch driver payments');
        return await response.json();
    },

    async addDriverPayment(id, paymentData) {
        const response = await fetch(`${API_URL}/drivers/${id}/payments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(paymentData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to record payment');
        return data;
    }
};
