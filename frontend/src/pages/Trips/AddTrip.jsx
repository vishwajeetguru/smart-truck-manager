import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DatePicker from '../../components/ui/DatePicker';
import { truckService } from '../../services/truckService';
import { tripService } from '../../services/tripService';
import { supplierService } from '../../services/supplierService';
import { materialService } from '../../services/materialService';
import { toast } from 'react-hot-toast';

const AddTrip = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        truck_id: '',
        trip_date: new Date().toISOString().split('T')[0],
        supplier: '',
        client: '',
        location: '',
        material: '',
        material_price: '',
        trips_count: '1',
        total_order_value: '',
        profit: '',
        total_expense: '',
        remark: '',
        payment_status: 'pending'
    });
    const [trucks, setTrucks] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [trucksData, suppliersData, materialsData] = await Promise.all([
                    truckService.getMyTrucks(),
                    supplierService.getMySuppliers(),
                    materialService.getMyMaterials()
                ]);
                setTrucks(trucksData);
                setSuppliers(suppliersData);
                setMaterials(materialsData);

                if (trucksData.length > 0) {
                    setFormData(prev => ({ ...prev, truck_id: trucksData[0].id }));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        let { name, value } = e.target;

        // Prevent negative values for numeric fields
        if (['material_price', 'trips_count', 'total_order_value', 'profit', 'total_expense'].includes(name)) {
            if (parseFloat(value) < 0) value = '0';
        }

        if (name === 'supplier' && value === 'new_supplier') {
            navigate('/add-supplier');
            return;
        }

        if (name === 'material' && value === 'new_material') {
            navigate('/add-material');
            return;
        }

        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            // Auto-calculate Total Order Value if Price or Count changes
            if (name === 'trips_count' || name === 'material_price') {
                const count = parseFloat(name === 'trips_count' ? value : prev.trips_count) || 0;
                const price = parseFloat(name === 'material_price' ? value : prev.material_price) || 0;
                updated.total_order_value = (count * price).toString();
            }

            // Auto-calculate Total Expense if total_order_value or profit changes
            const orderValue = parseFloat(name === 'total_order_value' ? value : updated.total_order_value) || 0;
            const profitValue = parseFloat(name === 'profit' ? value : updated.profit) || 0;
            updated.total_expense = (orderValue - profitValue).toString();

            return updated;
        });
    };

    const handleSave = async () => {
        if (!formData.truck_id || !formData.total_order_value) {
            toast.error(t('please_select_truck_and_details'));
            return;
        }

        setLoading(true);
        try {
            await tripService.addTrip({
                ...formData,
                trips_count: parseInt(formData.trips_count) || 1,
                material_price: parseFloat(formData.material_price) || 0,
                total_order_value: parseFloat(formData.total_order_value) || 0,
                profit: parseFloat(formData.profit) || 0,
                total_expense: parseFloat(formData.total_expense) || 0
            });
            toast.success('Trip saved successfully!');
            navigate('/trips');
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'uppercase' }}>{t('add_trip')}</h2>
            </div>

            <main style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Select
                        label={t('select_truck')}
                        name="truck_id"
                        value={formData.truck_id}
                        onChange={handleChange}
                        placeholder={t('select_truck')}
                        options={trucks.map(t_item => ({ value: t_item.id, label: t_item.truck_number }))}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <DatePicker
                        label={t('trip_date')}
                        name="trip_date"
                        value={formData.trip_date}
                        onChange={handleChange}
                    />
                    <Select
                        label={t('material')}
                        name="material"
                        value={formData.material}
                        onChange={handleChange}
                        placeholder={t('material')}
                        options={[
                            ...materials.map(m => ({ value: m.name, label: m.name })),
                            { value: 'new_material', label: t('add_new') }
                        ]}
                    />
                </div>

                <Input label={t('material_price')} type="number" name="material_price" placeholder="0" value={formData.material_price} onChange={handleChange} min="0" />

                <Select
                    label={t('supplier_name')}
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    placeholder={t('supplier_name')}
                    options={[
                        ...suppliers.map(s => ({ value: s.name, label: s.name })),
                        { value: 'new_supplier', label: t('add_new') }
                    ]}
                />

                <Input label={t('client_name')} placeholder={t('client_name_placeholder')} name="client" value={formData.client} onChange={handleChange} />
                <Input label={t('trips_count')} type="number" name="trips_count" value={formData.trips_count} onChange={handleChange} min="1" />
                <Input label={t('location')} placeholder={t('location_placeholder_trip')} name="location" value={formData.location} onChange={handleChange} />

                <div style={{ padding: '1.25rem', background: 'var(--color-bg-surface)', border: 'var(--border-width) solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Input label={`${t('total_value')} (₹)`} type="number" placeholder="0" name="total_order_value" value={formData.total_order_value} onChange={handleChange} style={{ color: 'var(--color-primary)', fontWeight: 900 }} min="0" />
                    <Input label={`${t('profit')} (₹)`} type="number" placeholder="0" name="profit" value={formData.profit} onChange={handleChange} style={{ color: 'var(--color-success)', fontWeight: 900 }} min="0" />

                    <Input label={`${t('total_expense')} (₹)`} type="number" placeholder="0" name="total_expense" value={formData.total_expense} onChange={handleChange} style={{ color: 'var(--color-error)', fontWeight: 900 }} min="0" />
                </div>

                <Input label={t('remark')} placeholder={t('remark_placeholder')} name="remark" value={formData.remark} onChange={handleChange} />

                <Select
                    label={t('payment_status')}
                    name="payment_status"
                    value={formData.payment_status}
                    onChange={handleChange}
                    options={[
                        { value: 'pending', label: t('pending') },
                        { value: 'received', label: t('received') }
                    ]}
                />

                <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
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
                        {loading ? t('saving') : t('save_trip')}
                    </button>
                    <div style={{ height: '1.5rem' }}></div>
                </div>

            </main>
        </div>
    );
};

export default AddTrip;
