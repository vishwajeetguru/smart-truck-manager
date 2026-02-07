import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MobileContainer from '../../components/layout/MobileContainer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DatePicker from '../../components/ui/DatePicker';
import { truckService } from '../../services/truckService';
import { expenseService } from '../../services/expenseService';
import { toast } from 'react-hot-toast';

const Expenses = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [trucks, setTrucks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        truck_id: '',
        category: 'Repair',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        description: ''
    });

    useEffect(() => {
        const fetchTrucks = async () => {
            try {
                const data = await truckService.getMyTrucks();
                setTrucks(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, truck_id: data[0].id }));
                }
            } catch (error) {
                console.error('Error fetching trucks:', error);
            }
        };
        fetchTrucks();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.truck_id || !formData.amount) {
            toast.error(t('please_select_truck_and_amount'));
            return;
        }

        setLoading(true);
        try {
            await expenseService.addExpense({
                ...formData,
                amount: parseFloat(formData.amount)
            });
            toast.success(t('added_successfully', 'Expense added successfully!'));
            navigate('/expenses');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-body)' }}>
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' }}>
                <button onClick={() => navigate('/expenses')} className="nb-shadow-sm" style={{
                    width: '2.75rem',
                    height: '2.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-surface)',
                    border: 'var(--border-width) solid var(--color-border)',
                    cursor: 'pointer'
                }}>
                    <span className="material-symbols-outlined" style={{ fontWeight: 900 }}>arrow_back</span>
                </button>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'uppercase' }}>{t('add_expense')}</h2>
            </div>

            <main style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Select
                        label={t('select_truck')}
                        name="truck_id"
                        value={formData.truck_id}
                        onChange={handleChange}
                        options={trucks.map(t => ({ value: t.id, label: t.truck_number }))}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{t('expense_type')}</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['tyre', 'repair', 'service', 'other'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFormData(prev => ({ ...prev, category: type }))}
                                className={formData.category.toLowerCase() === type ? 'nb-shadow-sm' : ''}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: 'var(--border-width) solid var(--color-border)',
                                    background: formData.category.toLowerCase() === type ? 'var(--color-error)' : 'var(--color-bg-surface)',
                                    color: formData.category.toLowerCase() === type ? '#fff' : 'var(--color-text-main)',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {t(type)}
                            </button>
                        ))}
                    </div>
                </div>

                <Input
                    label={`${t('amount')} (₹)`}
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0"
                    style={{ borderColor: 'var(--color-error)' }}
                />
                <DatePicker
                    label={t('date')}
                    name="expense_date"
                    value={formData.expense_date}
                    onChange={handleChange}
                />
                <Input
                    label={t('note_bill_no')}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={t('optional')}
                />

                <div style={{ flex: 1 }}></div>
                <Button
                    fullWidth
                    onClick={handleSave}
                    disabled={loading}
                    style={{
                        height: '3.5rem',
                        backgroundColor: loading ? 'var(--color-bg-surface)' : 'var(--color-error)',
                        color: loading ? 'var(--color-text-muted)' : 'white'
                    }}
                >
                    {loading ? t('saving') : t('save_expense')}
                </Button>
            </main>
        </div>
    );
};

export default Expenses;
