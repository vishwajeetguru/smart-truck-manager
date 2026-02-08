const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('truck_manager_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const supplierService = {
    async getMySuppliers() {
        const response = await fetch(`${API_URL}/suppliers`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch suppliers');
        return await response.json();
    },

    async addSupplier(supplierData) {
        const response = await fetch(`${API_URL}/suppliers`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(supplierData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to add supplier');
        return data;
    },

    async updateSupplier(id, supplierData) {
        const response = await fetch(`${API_URL}/suppliers/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(supplierData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update supplier');
        return data;
    },

    async deleteSupplier(id) {
        const response = await fetch(`${API_URL}/suppliers/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete supplier');
        return data;
    }
};
