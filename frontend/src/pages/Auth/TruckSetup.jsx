import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MobileContainer from '../../components/layout/MobileContainer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { truckService } from '../../services/truckService';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-hot-toast';

const TruckSetup = () => {
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const isFromSettings = location.state?.fromSettings || false;
    const truckCount = location.state?.truckCount || 1;
    const [loading, setLoading] = useState(false);

    // Manage array of trucks
    const [trucks, setTrucks] = useState(
        Array.from({ length: truckCount }, (_, i) => ({
            id: i,
            name: '',
            type: 'Diesel' // Default
        }))
    );

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('app_language', lng);
    };

    const handleChange = (index, field, value) => {
        const newTrucks = [...trucks];
        newTrucks[index][field] = value;
        setTrucks(newTrucks);
    };

    const handleSave = async () => {
        const filledTrucks = trucks.filter(t => t.name.trim() !== '');
        if (filledTrucks.length === 0) {
            toast.error('Please enter details for at least one truck');
            return;
        }

        setLoading(true);
        try {
            // Save all filled trucks
            await Promise.all(filledTrucks.map(truck =>
                truckService.addTruck({
                    truck_number: truck.name,
                    model: truck.type
                })
            ));

            if (isFromSettings) {
                navigate('/edit-profile');
            } else {
                navigate('/dashboard');
            }
            toast.success('Trucks added successfully!');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-body)' }}>
            {/* Conditional Header for Settings Mode */}
            {isFromSettings && (
                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'var(--color-bg-surface)', borderBottom: '2px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 20 }}>
                    <button onClick={() => navigate('/edit-profile')} className="nb-shadow-sm" style={{
                        width: '3rem',
                        height: '3rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-bg-surface)',
                        border: 'var(--border-width) solid var(--color-border)',
                        cursor: 'pointer'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontWeight: 900, fontSize: '1.75rem' }}>arrow_back</span>
                    </button>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{t('add_truck')}</h2>
                </div>
            )}

            <main style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>

                {/* Progress - Only show during onboarding */}
                {!isFromSettings && (
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Onboarding</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Step 4 of 4</span>
                        </div>
                        <div className="nb-border" style={{ height: '0.75rem', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-surface)', overflow: 'hidden' }}>
                            <div style={{ width: '100%', height: '100%', background: 'var(--color-success)' }}></div>
                        </div>
                    </div>
                )}

                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.2, color: 'var(--color-text-main)' }}>
                    Add Your <br /> <span style={{ color: 'var(--color-primary)' }}>Truck Details</span>
                </h1>

                {trucks.map((truck, index) => (
                    <div key={truck.id} className="nb-border" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--color-bg-surface)', marginBottom: '1rem', border: '2px solid black', boxShadow: '4px 4px 0px black' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'uppercase' }}>Truck #{index + 1}</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <Input
                                label="Nick Name / Number"
                                placeholder="e.g. MH 12 AB 1234"
                                value={truck.name}
                                onChange={(e) => handleChange(index, 'name', e.target.value)}
                            />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ fontWeight: 900, fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--color-text-main)', letterSpacing: '0.05em' }}>Fuel Type</label>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    {['Diesel', 'Petrol'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => handleChange(index, 'type', type)}
                                            style={{
                                                flex: 1,
                                                padding: '1rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: '2px solid black',
                                                background: truck.type === type ? 'var(--color-primary)' : 'white',
                                                color: truck.type === type ? '#fff' : 'var(--color-text-main)',
                                                fontWeight: 900,
                                                cursor: 'pointer',
                                                boxShadow: truck.type === type ? '2px 2px 0px black' : 'none',
                                                textTransform: 'uppercase',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <div style={{ flex: 1, minHeight: '2rem' }}></div>

                <Button
                    fullWidth
                    onClick={handleSave}
                    disabled={loading}
                    style={{
                        height: 'auto',
                        padding: '1.5rem',
                        fontSize: '1.25rem',
                        textTransform: 'uppercase',
                        fontWeight: 900,
                        boxShadow: '4px 4px 0px black'
                    }}
                >
                    {loading ? 'Saving...' : (isFromSettings ? 'Add Truck' : 'Finish Setup')}
                </Button>
                <div style={{ height: '2rem' }}></div>

            </main>
        </div>
    );
};

export default TruckSetup;
