import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/ui/Card';
import { supplierService } from '../../services/supplierService';
import { toast } from 'react-hot-toast';

const SupplierList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const data = await supplierService.getMySuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('confirm_delete_supplier'))) {
            try {
                await supplierService.deleteSupplier(id);
                setSuppliers(suppliers.filter(s => s.id !== id));
                toast.success('Supplier deleted successfully');
            } catch (error) {
                toast.error(t('failed_delete_supplier'));
            }
        }
    };

    const handleCall = (mobile) => {
        window.location.href = `tel:${mobile}`;
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
                    <p style={{ fontWeight: 800, color: 'var(--color-text-main)' }}>{t('loading_details')}</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-body)' }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' }}>
                <button onClick={() => navigate('/dashboard')} className="nb-shadow-sm" style={{
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'uppercase' }}>{t('suppliers')}</h2>
            </div>

            <main style={{ flex: 1, padding: '1.25rem', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {suppliers.map((supplier) => (
                        <Card key={supplier.id} className="nb-shadow-sm" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 900, marginBottom: '0.25rem' }}>{supplier.name}</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '0.25rem' }}>location_on</span>
                                        {supplier.address || t('no_address')}
                                    </p>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '0.25rem' }}>call</span>
                                        {supplier.mobile}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleCall(supplier.mobile)}
                                        style={{
                                            background: 'var(--color-success)', color: '#fff',
                                            border: 'none', borderRadius: 'var(--radius-md)',
                                            width: '2.5rem', height: '2.5rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <span className="material-symbols-outlined">call</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(supplier.id)}
                                        style={{
                                            background: 'var(--color-bg-surface)', color: 'var(--color-error)',
                                            border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)',
                                            width: '2.5rem', height: '2.5rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {suppliers.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                            {t('no_suppliers_found')}
                        </div>
                    )}
                </div>
                <div style={{ height: '5rem' }}></div>
            </main>

            {/* Floating Action Button */}
            <button
                onClick={() => navigate('/add-supplier')}
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

export default SupplierList;
