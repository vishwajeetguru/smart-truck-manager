const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('truck_manager_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const fuelService = {
    async getMyFuelExpenses() {
        const response = await fetch(`${API_URL}/fuel-expenses`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch fuel expenses');
        return await response.json();
    },

    async addFuelExpense(expenseData) {
        const response = await fetch(`${API_URL}/fuel-expenses`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(expenseData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to add fuel expense');
        return data;
    },

    async deleteFuelExpense(id) {
        const response = await fetch(`${API_URL}/fuel-expenses/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete fuel expense');
        return data;
    }
};
