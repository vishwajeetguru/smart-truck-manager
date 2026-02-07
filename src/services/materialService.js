const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('truck_manager_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const materialService = {
    async getMyMaterials() {
        const response = await fetch(`${API_URL}/materials`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch materials');
        return await response.json();
    },

    async addMaterial(materialData) {
        const response = await fetch(`${API_URL}/materials`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(materialData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to add material');
        return data;
    },

    async updateMaterial(id, materialData) {
        const response = await fetch(`${API_URL}/materials/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(materialData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update material');
        return data;
    },

    async deleteMaterial(id) {
        const response = await fetch(`${API_URL}/materials/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete material');
        return data;
    }
};
