const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('truck_manager_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const tripService = {
    async getMyTrips() {
        const response = await fetch(`${API_URL}/trips`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch trips');
        return await response.json();
    },

    async addTrip(tripData) {
        const response = await fetch(`${API_URL}/trips`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(tripData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to add trip');
        return data;
    },

    async updateTrip(tripId, updates) {
        const response = await fetch(`${API_URL}/trips/${tripId}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update trip');
        return data;
    },

    async deleteTrip(tripId) {
        const response = await fetch(`${API_URL}/trips/${tripId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete trip');
        return true;
    }
};
