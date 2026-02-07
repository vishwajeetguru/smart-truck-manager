import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DatePicker from '../../components/ui/DatePicker';
import { fuelService } from '../../services/fuelService';
import { truckService } from '../../services/truckService';
import { petrolPumpService } from '../../services/petrolPumpService';
import { driverService } from '../../services/driverService';
import { toast } from 'react-hot-toast';

const AddFuelExpense = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [trucks, setTrucks] = useState([]);
    const [pumps, setPumps] = useState([]);
    const [drivers, setDrivers] = useState([]);

    const [formData, setFormData] = useState({
        truck_id: '',
        pump_id: '',
        expense_date: new Date().toISOString().split('T')[0],
        amount: '',
        liters: '',
        filled_by: 'Self',
        driver_id: '',
        receipt_url: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [trucksData, pumpsData, driversData] = await Promise.all([
                    truckService.getMyTrucks(),
                    petrolPumpService.getMyPetrolPumps(),
                    driverService.getMyDrivers()
                ]);
                setTrucks(trucksData);
                setPumps(pumpsData);
                setDrivers(driversData);

                if (trucksData.length > 0) setFormData(prev => ({ ...prev, truck_id: trucksData[0].id }));
                if (driversData.length === 1) setFormData(prev => ({ ...prev, driver_id: driversData[0].id }));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'pump_id' && value === 'new_pump') {
            navigate('/add-petrol-pump');
            return;
        }

        if (name === 'driver_id' && value === 'new_driver') {
            navigate('/add-driver');
            return;
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, receipt_url: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!formData.truck_id || !formData.amount || !formData.liters) {
            toast.error(t('please_fill_required_fields_fuel'));
            return;
        }

        setLoading(true);
        try {
            await fuelService.addFuelExpense({
                ...formData,
                amount: parseFloat(formData.amount),
                liters: parseFloat(formData.liters),
                pump_id: formData.pump_id || null,
                driver_id: formData.filled_by === 'Driver' ? formData.driver_id : null
            });
            toast.success(t('added_successfully', 'Added successfully!'));
            navigate('/fuel-expenses');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-body)' }}>
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' }}>
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'uppercase' }}>{t('add_fuel')}</h2>
            </div>

            <main style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
                <Select
                    label={t('select_truck')}
                    name="truck_id"
                    value={formData.truck_id}
                    onChange={handleChange}
                    options={trucks.map(t_item => ({ value: t_item.id, label: t_item.truck_number }))}
                />

                <Select
                    label={t('petrol_pump')}
                    name="pump_id"
                    value={formData.pump_id}
                    onChange={handleChange}
                    placeholder={t('select_pump')}
                    options={[
                        ...pumps.map(p => ({ value: p.id, label: p.name })),
                        { value: 'new_pump', label: `+ ${t('add_pump')}` }
                    ]}
                />

                <DatePicker label={t('fuel_date')} name="expense_date" value={formData.expense_date} onChange={handleChange} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input label={`${t('amount')} (₹)`} type="number" name="amount" value={formData.amount} onChange={handleChange} />
                    <Input label={t('liters')} type="number" name="liters" value={formData.liters} onChange={handleChange} />
                </div>

                <Select
                    label={t('who_filled_fuel')}
                    name="filled_by"
                    value={formData.filled_by}
                    onChange={handleChange}
                    options={[
                        { value: 'Self', label: `${t('self')} (${t('owner')})` },
                        { value: 'Driver', label: t('drivers').slice(0, -1) || t('driver_name').split(' ')[0] } // Hacky but works for now, or I search for a better key
                    ]}
                />

                {formData.filled_by === 'Driver' && (
                    <Select
                        label={t('select_driver')}
                        name="driver_id"
                        value={formData.driver_id}
                        onChange={handleChange}
                        options={
                            drivers.length > 0
                                ? drivers.map(d => ({ value: d.id, label: d.name }))
                                : [{ value: 'new_driver', label: `+ ${t('add_driver')}` }]
                        }
                    />
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{t('receipt_photo')}</label>
                    <div className="nb-shadow-sm" style={{
                        padding: '1.5rem',
                        background: 'var(--color-bg-surface)',
                        border: 'var(--border-width) solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center',
                        position: 'relative'
                    }}>
                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }} />
                        {formData.receipt_url ? (
                            <img src={formData.receipt_url} alt="Receipt" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-sm)' }} />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>add_a_photo</span>
                                <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>{t('click_to_upload_receipt')}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="nb-shadow"
                        style={{
                            width: '100%',
                            padding: '1.25rem',
                            background: loading ? 'var(--color-bg-surface)' : 'var(--color-primary)',
                            color: loading ? 'var(--color-text-muted)' : '#fff',
                            border: 'var(--border-width) solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 900,
                            fontSize: '1.25rem',
                            textTransform: 'uppercase',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? t('saving') : t('save_fuel')}
                    </button>
                    <div style={{ height: '2rem' }}></div>
                </div>
            </main>
        </div>
    );
};

export default AddFuelExpense;
