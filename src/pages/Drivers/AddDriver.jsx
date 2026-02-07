import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { driverService } from '../../services/driverService';
import { truckService } from '../../services/truckService';
import { toast } from 'react-hot-toast';

const AddDriver = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [form, setForm] = useState({
        name: '',
        license_number: '',
        mobiles: [''],
        blood_group: '',
        salary: '',
        advance: '',
        assigned_truck_id: '',
        photo: null,
        aadhar: null,
    });
    const [trucks, setTrucks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);

    // Fetch trucks for assignment dropdown
    useEffect(() => {
        const fetchTrucks = async () => {
            try {
                const data = await truckService.getMyTrucks();
                setTrucks(data);
            } catch (e) {
                console.error('Failed to fetch trucks', e);
            }
        };
        fetchTrucks();
    }, []);

    // Fetch driver data if in edit mode
    useEffect(() => {
        if (isEditMode) {
            const fetchDriver = async () => {
                try {
                    const driver = await driverService.getDriver(id);
                    if (driver) {
                        // Priority to 'mobiles' array if it exists and has items, otherwise use primary/secondary
                        let contactNumbers = [];
                        if (driver.mobiles && Array.isArray(driver.mobiles) && driver.mobiles.length > 0) {
                            contactNumbers = driver.mobiles;
                        } else {
                            contactNumbers = [driver.mobile_primary, driver.mobile_secondary].filter(m => m);
                        }

                        setForm({
                            name: driver.name || '',
                            license_number: driver.license_number || '',
                            mobiles: contactNumbers.length > 0 ? contactNumbers : [''],
                            blood_group: driver.blood_group || '',
                            salary: driver.salary || '',
                            advance: driver.advance || '',
                            assigned_truck_id: driver.assigned_truck_id || '',
                            photo: driver.photo_url || driver.photo || null,
                            aadhar: driver.aadhar_url || driver.aadhar_photo || null,
                        });
                    }
                } catch (e) {
                    console.error('Failed to fetch driver details', e);
                } finally {
                    setFetching(false);
                }
            };
            fetchDriver();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files && files[0]) {
            // Validation: Max 5MB
            if (files[0].size > 5 * 1024 * 1024) {
                toast.error('File size exceeds 5MB limit');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setForm((prev) => ({ ...prev, [name]: reader.result }));
            };
            reader.readAsDataURL(files[0]);
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleMobileChange = (index, value) => {
        const newMobiles = [...form.mobiles];
        newMobiles[index] = value;
        setForm((prev) => ({ ...prev, mobiles: newMobiles }));
    };

    const addMobileField = () => {
        setForm((prev) => ({ ...prev, mobiles: [...prev.mobiles, ''] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            name: form.name,
            license_number: form.license_number,
            mobiles: form.mobiles.filter((m) => m && m.trim() !== ''),
            blood_group: form.blood_group,
            salary: form.salary ? parseFloat(form.salary) : null,
            advance: form.advance ? parseFloat(form.advance) : null,
            assigned_truck_id: form.assigned_truck_id || null,
            photo_url: form.photo,
            aadhar_url: form.aadhar,
        };

        try {
            if (isEditMode) {
                await driverService.updateDriver(id, payload);
            } else {
                await driverService.addDriver(payload);
            }
            toast.success(isEditMode ? 'Driver updated successfully' : 'Driver added successfully');
            navigate('/drivers');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg-body)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        border: '4px solid var(--color-primary)',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        margin: '0 auto 1rem',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ fontWeight: 800, color: 'var(--color-text-main)' }}>{t('loading_details')}</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-main)' }}>
            {/* Header with Back button */}
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'uppercase' }}>
                    {isEditMode ? t('update_driver') : t('add_driver')}
                </h2>
            </div>

            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
                <Input
                    label={t('full_name')}
                    name="name"
                    placeholder={t('full_name_placeholder')}
                    value={form.name}
                    onChange={handleChange}
                    required
                />
                <Input
                    label={t('license')}
                    name="license_number"
                    placeholder={t('license_placeholder')}
                    value={form.license_number}
                    onChange={handleChange}
                    required
                />
                <div>
                    <label style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block', fontSize: '0.875rem' }}>{t('mobile')}</label>
                    {form.mobiles.map((mobile, idx) => (
                        <div key={idx} style={{ marginBottom: '0.5rem' }}>
                            <Input
                                placeholder={t('mobile_placeholder_driver')}
                                value={mobile}
                                onChange={(e) => handleMobileChange(idx, e.target.value)}
                            />
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addMobileField}
                        className="nb-shadow-sm"
                        style={{
                            padding: '0.6rem 1.25rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--color-bg-surface)',
                            border: 'var(--border-width) solid var(--color-border)',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginTop: '0.5rem'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', fontWeight: 900 }}>add_circle</span>
                        {t('add_new')}
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <Input
                        label={t('blood_group')}
                        name="blood_group"
                        placeholder={t('blood_group_placeholder')}
                        value={form.blood_group}
                        onChange={handleChange}
                    />
                    <Input
                        label={t('salary')}
                        type="number"
                        name="salary"
                        placeholder={t('salary_placeholder')}
                        value={form.salary}
                        onChange={handleChange}
                    />
                </div>

                <Input
                    label={t('advance')}
                    type="number"
                    name="advance"
                    placeholder={t('advance_placeholder')}
                    value={form.advance}
                    onChange={handleChange}
                />

                <Select
                    label={t('assign_truck')}
                    name="assigned_truck_id"
                    value={form.assigned_truck_id}
                    onChange={handleChange}
                    placeholder={t('select_truck')}
                    options={trucks.map(t_item => ({ value: t_item.id, label: t_item.truck_number }))}
                />

                {/* Photo Upload */}
                <div>
                    <label style={{ fontWeight: 800, marginBottom: '0.75rem', display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('driver_photo')}</label>
                    <div className="nb-shadow-sm" style={{
                        padding: '1rem',
                        background: 'var(--color-bg-surface)',
                        border: '2px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--color-text-muted)', fontSize: '1.5rem' }}>image</span>
                            <span style={{ fontSize: '0.9rem', color: form.photo ? 'var(--color-text-main)' : 'var(--color-text-muted)', fontWeight: 700 }}>
                                {form.photo ? t('photo_added') : t('no_photo')}
                            </span>
                        </div>
                        <label
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--color-bg-body)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                color: 'var(--color-text-main)',
                                border: '2px solid var(--color-border)',
                                textTransform: 'uppercase'
                            }}
                        >
                            {t('select_truck').split(' ')[0]} {/* Works for Select, निवडा, चुनें */}
                            <input
                                type="file"
                                name="photo"
                                accept="image/*"
                                onChange={handleChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                    {form.photo && (
                        <div className="nb-shadow" style={{ marginTop: '1.25rem', maxWidth: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px solid var(--color-border)' }}>
                            <img src={form.photo} alt="Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                    )}
                </div>

                {/* Aadhar Upload */}
                <div>
                    <label style={{ fontWeight: 800, marginBottom: '0.75rem', display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('aadhar_card')}</label>
                    <div className="nb-shadow-sm" style={{
                        padding: '1rem',
                        background: 'var(--color-bg-surface)',
                        border: '2px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--color-text-muted)', fontSize: '1.5rem' }}>id_card</span>
                            <span style={{ fontSize: '0.9rem', color: form.aadhar ? 'var(--color-text-main)' : 'var(--color-text-muted)', fontWeight: 700 }}>
                                {form.aadhar ? t('aadhar_added') : t('no_aadhar')}
                            </span>
                        </div>
                        <label
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--color-bg-body)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                color: 'var(--color-text-main)',
                                border: '2px solid var(--color-border)',
                                textTransform: 'uppercase'
                            }}
                        >
                            {t('select_truck').split(' ')[0]}
                            <input
                                type="file"
                                name="aadhar"
                                accept="image/*"
                                onChange={handleChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                    {form.aadhar && (
                        <div className="nb-shadow" style={{ marginTop: '1.25rem', maxWidth: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px solid var(--color-border)' }}>
                            <img src={form.aadhar} alt="Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                    )}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '2.5rem' }}>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="nb-button"
                        style={{
                            width: '100%',
                            padding: '1.25rem',
                            background: loading ? 'var(--color-bg-surface)' : 'var(--color-primary)',
                            color: loading ? 'var(--color-text-muted)' : '#fff',
                            border: 'var(--border-width) solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            fontWeight: 900,
                            fontSize: '1.2rem',
                            textTransform: 'uppercase',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: loading ? 'none' : 'var(--shadow-offset) var(--shadow-offset) 0px 0px var(--color-border)'
                        }}
                    >
                        {loading ? t('saving') : isEditMode ? t('update_driver') : t('save_new_driver')}
                    </button>
                    <div style={{ height: '4rem' }}></div>
                </div>
            </div>
        </div>
    );
};

export default AddDriver;
