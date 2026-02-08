import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MobileContainer from '../../components/layout/MobileContainer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DatePicker from '../../components/ui/DatePicker';
import { tripService } from '../../services/tripService';
import { paymentService } from '../../services/paymentService';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AddPayment = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const prefilledClient = location.state?.clientName || '';

    const [formData, setFormData] = useState({
        trip_id: '',
        amount: '',
        mode: 'Cash',
        date: new Date().toISOString().split('T')[0],
        reminder: ''
    });
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const data = await tripService.getMyTrips();
                setTrips(data);

                // Handle pre-filled data from navigation state
                const prefilledTripId = location.state?.tripId;
                const prefilledAmount = location.state?.amount;

                if (prefilledTripId) {
                    setFormData(prev => ({
                        ...prev,
                        trip_id: prefilledTripId,
                        amount: prefilledAmount || prev.amount
                    }));
                } else if (data.length > 0) {
                    setFormData(prev => ({ ...prev, trip_id: data[0].id }));
                }
            } catch (error) {
                console.error('Error fetching trips:', error);
            }
        };
        fetchTrips();
    }, [location.state]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!formData.trip_id || !formData.amount) {
            toast.error(t('please_select_trip_and_amount', 'Please select trip and enter amount'));
            return;
        }

        setLoading(true);
        try {
            await paymentService.addPayment({
                trip_id: formData.trip_id,
                amount: parseFloat(formData.amount),
                payment_date: new Date(formData.date).toISOString(),
                status: 'paid' // Recording a payment marks it as paid
            });
            toast.success(t('added_successfully', 'Payment recorded successfully!'));
            navigate('/payments');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-main)' }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-bg-surface)' }}>
                <button onClick={() => navigate(-1)} className="nb-shadow-sm" style={{
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'uppercase' }}>{t('record_payment')}</h2>
            </div>

            <main style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Select
                        label={t('select_trip_client')} // Add this key
                        name="trip_id"
                        value={formData.trip_id}
                        onChange={handleChange}
                        placeholder={t('select_trip')}
                        options={trips.map(t_item => ({
                            value: t_item.id,
                            label: `${t_item.client} - ${t_item.material} (${new Date(t_item.trip_date).toLocaleDateString()})`
                        }))}
                    />
                </div>

                <Input
                    label={`${t('payment_amount')} (₹)`}
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    style={{ border: 'var(--border-width) solid var(--color-success)' }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--color-text-main)' }}>{t('payment_mode')}</label>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {[
                            { key: 'Cash', label: t('cash') },
                            { key: 'UPI', label: t('upi') },
                            { key: 'Bank', label: t('bank_transfer') }
                        ].map(mode => (
                            <button
                                key={mode.key}
                                onClick={() => setFormData({ ...formData, mode: mode.key })}
                                className={formData.mode === mode.key ? 'nb-shadow-sm' : ''}
                                style={{
                                    flex: 1,
                                    padding: '1rem 0.5rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: 'var(--border-width) solid var(--color-border)',
                                    background: formData.mode === mode.key ? 'var(--color-primary)' : 'var(--color-bg-surface)',
                                    color: formData.mode === mode.key ? '#fff' : 'var(--color-text-main)',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontSize: '0.8rem'
                                }}
                            >
                                {mode.label}
                            </button>
                        ))}
                    </div>
                </div>

                <DatePicker label={t('payment_date')} name="date" value={formData.date} onChange={handleChange} />

                <DatePicker label={t('next_reminder_optional')} name="reminder" value={formData.reminder} onChange={handleChange} />

                <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="nb-shadow"
                        style={{
                            width: '100%',
                            padding: '1.25rem',
                            background: loading ? 'var(--color-bg-surface)' : 'var(--color-success)',
                            color: loading ? 'var(--color-text-muted)' : '#fff',
                            border: 'var(--border-width) solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 900,
                            fontSize: '1.25rem',
                            textTransform: 'uppercase',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? t('saving') : t('record_payment')}
                    </button>
                </div>

            </main>
        </div>
    );
};

export default AddPayment;
