const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('truck_manager_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const expenseService = {
    async addExpense(expenseData) {
        const response = await fetch(`${API_URL}/expenses`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(expenseData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to add expense');
        return data;
    },

    async getMyExpenses() {
        const response = await fetch(`${API_URL}/expenses`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch expenses');
        return await response.json();
    }
};
