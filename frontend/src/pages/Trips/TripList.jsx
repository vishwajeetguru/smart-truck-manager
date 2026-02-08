import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import FilterDrawer from '../../components/ui/FilterDrawer';
import { tripService } from '../../services/tripService';
import { truckService } from '../../services/truckService';

const TripList = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [trips, setTrips] = useState([]);
    const [trucks, setTrucks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        format: '', // Mandatory
        dateRange: 'weekly',
        truck: 'all',
        client: 'all',
        supplier: 'all',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [tripsData, trucksData] = await Promise.all([
                    tripService.getMyTrips(),
                    truckService.getMyTrucks()
                ]);
                setTrips(tripsData);
                setTrucks(trucksData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredTrips = filters.truck === 'all'
        ? trips
        : trips.filter(t => t.truck_id === filters.truck);

    const shareOnWhatsApp = (trip) => {
        const date = new Date(trip.trip_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const message = `${t('trip_report_title')}
----------------------
🗓️ ${t('date')}: ${date}
🚚 ${t('truck')}: ${trip.truck_number} ${trip.truck_model ? `(${trip.truck_model})` : ''}
📍 ${t('location')}: ${trip.location || t('not_available')}
👤 ${t('client')}: ${trip.client || t('not_available')}
🤝 ${t('supplier')}: ${trip.supplier || t('not_available')}
📦 ${t('material')}: ${trip.material}
💰 ${t('rate')}: ₹${trip.material_price || 0}
📊 ${t('trips_count')}: ${trip.trips_count}
💵 ${t('total_value')}: ₹${trip.amount?.toLocaleString()}
✅ ${t('status')}: ${trip.status === 'received' ? t('received').toUpperCase() : t('pending').toUpperCase()}
----------------------
💸 ${t('profit')}: ₹${(Number(trip.profit) || 0).toLocaleString()}
📉 ${t('total_expense')}: ₹${(Number(trip.total_expense) || 0).toLocaleString()}
📝 ${t('remark')}: ${trip.remark || t('not_available')}

*${t('generated_via_app')}*`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    if (loading) {
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
                    <p style={{ fontWeight: 800, color: 'var(--color-text-main)' }}>{t('loading')}</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '2px solid var(--color-border)' }}>
                <button onClick={() => navigate('/dashboard')} className="nb-button" style={{ width: '2.5rem', height: '2.5rem', padding: 0, borderRadius: 'var(--radius-md)' }}>
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase' }}>{t('my_trips')}</h2>
            </div>

            <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
                {/* Filters */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <Select
                        label={t('filter_truck')}
                        value={filters.truck}
                        onChange={(e) => setFilters(prev => ({ ...prev, truck: e.target.value }))}
                        options={[
                            { value: 'all', label: t('all_trucks') },
                            ...trucks.map(truck => ({ value: truck.id, label: truck.truck_number }))
                        ]}
                    />
                </div>

                {/* Trip List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredTrips.map(trip => (
                        <Card key={trip.id} className="nb-shadow-sm" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>local_shipping</span>
                                        <span style={{ fontWeight: 900, fontSize: '1rem' }}>{trip.truck_number}</span>
                                        {trip.truck_model && <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'var(--color-bg-body)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{trip.truck_model}</span>}
                                    </div>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                                        {new Date(trip.trip_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {trip.location}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                                    <p style={{ fontWeight: 900, fontSize: '1.125rem', color: 'var(--color-success)' }}>₹{trip.amount?.toLocaleString()}</p>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '1rem', background: trip.status === 'received' ? 'var(--color-success)20' : 'var(--color-warning)20', color: trip.status === 'received' ? 'var(--color-success)' : 'var(--color-warning)', textTransform: 'uppercase' }}>
                                            {trip.status === 'received' ? t('received') : t('pending')}
                                        </span>
                                        <button
                                            onClick={() => shareOnWhatsApp(trip)}
                                            style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: '50%', width: '1.75rem', height: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>share</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                paddingTop: '1rem',
                                borderTop: '1px solid #eee'
                            }}>
                                <div>
                                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.1rem' }}>{t('material_rate')}</p>
                                    <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{trip.material || 'N/A'} <span style={{ color: 'var(--color-primary)', fontSize: '0.75rem' }}>(@₹{trip.material_price || 0})</span></p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.1rem' }}>{t('trips_count')} & {t('location')}</p>
                                    <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{trip.trips_count} {t('my_trips')} • {trip.location || 'Site'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.1rem' }}>👤 {t('client_name')}</p>
                                    <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{trip.client || 'N/A'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.1rem' }}>🤝 {t('supplier_name')}</p>
                                    <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{trip.supplier || 'N/A'}</p>
                                </div>
                                <div style={{ background: 'var(--color-bg-body)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--color-border)' }}>
                                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.1rem' }}>💸 {t('profit')}</p>
                                    <p style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--color-success)' }}>₹{(Number(trip.profit) || 0).toLocaleString()}</p>
                                </div>
                                <div style={{ background: 'var(--color-bg-body)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--color-border)' }}>
                                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.1rem' }}>📉 {t('total_expense')}</p>
                                    <p style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--color-error)' }}>₹{(Number(trip.total_expense) || 0).toLocaleString()}</p>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.1rem' }}>📝 {t('remark')}</p>
                                    <p style={{ fontWeight: 600, fontSize: '0.8rem', color: trip.remark ? 'var(--color-text-main)' : 'var(--color-text-muted)', fontStyle: trip.remark ? 'normal' : 'italic' }}>
                                        {trip.remark || t('no_trips')}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {filteredTrips.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '4rem 2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1.5rem'
                        }}>
                            <div className="nb-shadow" style={{
                                width: '8rem',
                                height: '8rem',
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--color-bg-surface)',
                                border: '3px solid var(--color-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span className="material-symbols-outlined" style={{
                                    fontSize: '5rem',
                                    color: 'var(--color-text-muted)',
                                    opacity: 0.3
                                }}>local_shipping</span>
                            </div>
                            <div>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    marginBottom: '0.5rem',
                                    color: 'var(--color-text-main)'
                                }}>{t('no_trips')}</h3>
                                <p style={{
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    color: 'var(--color-text-muted)',
                                    lineHeight: 1.5
                                }}>
                                    {filters.truck === 'all'
                                        ? t('start_tracking')
                                        : t('no_trips')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ height: '6rem' }}></div>
            </main>

            {/* Floating Action Button */}
            <button
                onClick={() => navigate('/add-trip')}
                className="nb-shadow"
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '1.5rem',
                    width: '3.5rem',
                    height: '3.5rem',
                    borderRadius: '1.25rem',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    border: '2px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10
                }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: '2rem', fontWeight: 900 }}>add</span>
            </button>
        </div>
    );
};

export default TripList;
