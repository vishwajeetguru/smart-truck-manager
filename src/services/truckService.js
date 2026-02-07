const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('truck_manager_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const truckService = {
    async getMyTrucks() {
        const response = await fetch(`${API_URL}/trucks`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch trucks');
        return await response.json();
    },

    async addTruck(truckData) {
        const response = await fetch(`${API_URL}/trucks`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(truckData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to add truck');
        return data;
    },

    async updateTruck(truckId, updates) {
        const response = await fetch(`${API_URL}/trucks/${truckId}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update truck');
        return data;
    },

    async deleteTruck(truckId) {
        const response = await fetch(`${API_URL}/trucks/${truckId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete truck');
        return true;
    }
};
