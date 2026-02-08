import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileContainer from '../../components/layout/MobileContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const Drivers = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('list'); // 'list' or 'add'

    // Add Driver Form State
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        salary: '',
        truck: ''
    });

    const mockDrivers = [
        { id: 1, name: 'Suresh Patil', mobile: '9876543210', salary: '25000', truck: 'MH 12 AB 1234' },
        { id: 2, name: 'Ramesh Kale', mobile: '9988776655', salary: '22000', truck: 'MH 14 CD 5678' },
    ];

    const handleSave = () => {
        // Save logic
        setView('list');
    };

    if (view === 'add') {
        return (
            <>
                <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => setView('list')} className="nb-button" style={{ width: '2.5rem', height: '2.5rem', padding: 0, borderRadius: 'var(--radius-md)' }}>
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 800, textTransform: 'uppercase' }}>Add Driver</h2>
                </div>
                <main style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <div className="nb-border" style={{ width: '6rem', height: '6rem', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--color-text-muted)' }}>add_a_photo</span>
                        </div>
                    </div>
                    <Input label="Driver Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <Input label="Mobile Number" type="tel" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
                    <Input label="Salary (₹)" type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Select
                            label="Assign Truck"
                            name="truck"
                            value={formData.truck}
                            onChange={(e) => setFormData({ ...formData, truck: e.target.value })}
                            options={[
                                { value: 'MH 12 AB 1234', label: 'MH 12 AB 1234' },
                                { value: 'MH 14 CD 5678', label: 'MH 14 CD 5678' }
                            ]}
                            placeholder="Select Truck"
                        />
                    </div>

                    <div style={{ flex: 1 }}></div>
                    <Button fullWidth onClick={handleSave} style={{ height: '3.5rem' }}>Save Driver</Button>
                </main>
            </>
        );
    }

    return (
        <>
            <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => navigate('/dashboard')} className="nb-button" style={{ width: '2.5rem', height: '2.5rem', padding: 0, borderRadius: 'var(--radius-md)' }}>
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 800, textTransform: 'uppercase' }}>Drivers</h2>
            </div>

            <main style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
                {mockDrivers.map(driver => (
                    <Card key={driver.id} noPadding style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }} className="nb-shadow-sm">
                        <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: '#cbd5e1', overflow: 'hidden' }}>
                            <img src={`https://ui-avatars.com/api/?name=${driver.name}&background=random`} alt="Driver" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontWeight: 800 }}>{driver.name}</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{driver.truck}</p>
                        </div>
                        <div>
                            <a href={`tel:${driver.mobile}`} className="nb-button" style={{
                                width: '2.5rem', height: '2.5rem',
                                padding: 0, borderRadius: 'var(--radius-full)',
                                background: 'var(--color-success)', color: '#fff'
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>call</span>
                            </a>
                        </div>
                    </Card>
                ))}

                <div style={{ position: 'fixed', bottom: '2rem', right: '50%', transform: 'translateX(50%)', zIndex: 10 }}>
                    <Button onClick={() => setView('add')} style={{ borderRadius: 'var(--radius-full)', padding: '1rem 2rem' }}>
                        <span className="material-symbols-outlined" style={{ marginRight: '0.5rem' }}>add</span>
                        Add Driver
                    </Button>
                </div>
            </main>
        </>
    );
};

export default Drivers;
