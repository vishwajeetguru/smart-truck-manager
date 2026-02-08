const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('truck_manager_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const petrolPumpService = {
    async getMyPetrolPumps() {
        const response = await fetch(`${API_URL}/petrol-pumps`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch petrol pumps');
        return await response.json();
    },

    async addPetrolPump(pumpData) {
        const response = await fetch(`${API_URL}/petrol-pumps`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(pumpData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to add petrol pump');
        return data;
    },

    async deletePetrolPump(id) {
        const response = await fetch(`${API_URL}/petrol-pumps/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete petrol pump');
        return data;
    }
};
