import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FilterDrawer from '../../components/ui/FilterDrawer';
import { paymentService } from '../../services/paymentService';

const PaymentList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Pending');
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [filters, setFilters] = useState({
        format: 'pdf',
        dateRange: 'monthly',
        truck: 'all',
        client: 'all',
        supplier: 'all'
    });

    const handleApplyFilters = () => {
        setIsFilterOpen(false);
        // Add actual filtering logic here if needed
    };

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                const data = await paymentService.getMyPayments();
                setPayments(data);
            } catch (error) {
                console.error('Error fetching payments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const filteredPayments = payments.filter(p =>
        activeTab === 'Pending' ? p.status === 'pending' || p.status === 'overdue' :
            activeTab === 'Received' ? p.status === 'received' :
                false
    );

    const overduePayments = filteredPayments.filter(p => p.status === 'overdue');
    const totalPending = payments
        .filter(p => p.status === 'pending' || p.status === 'overdue')
        .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    const tabs = [
        { key: 'Pending', label: t('tabs.pending') },
        { key: 'Received', label: t('tabs.received') },
        { key: 'Drafts', label: t('tabs.drafts') }
    ];

    const PaymentDetailModal = ({ payment, onClose }) => {
        if (!payment) return null;
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                backdropFilter: 'blur(8px)',
                padding: '2rem'
            }}>
                <Card style={{
                    maxWidth: '450px',
                    width: '100%',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    background: 'var(--color-bg-surface)'
                }} className="nb-shadow">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase' }}>{t('payment_details')}</h3>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-main)' }}>
                            <span className="material-symbols-outlined" style={{ fontWeight: 900 }}>close</span>
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div style={{ gridColumn: 'span 2', background: 'var(--color-bg-body)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--color-border)' }}>
                            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{t('amount_to_receive')}</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)' }}>₹{payment.amount?.toLocaleString()}</p>
                        </div>

                        <div>
                            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{t('material')}</p>
                            <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{payment.material || 'N/A'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{t('price')}</p>
                            <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>₹{payment.material_price || 0}</p>
                        </div>

                        <div>
                            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>👤 {t('client_name')}</p>
                            <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{payment.client || 'N/A'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>🤝 {t('supplier_name')}</p>
                            <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{payment.supplier || 'N/A'}</p>
                        </div>

                        <div>
                            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{t('location')}</p>
                            <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{payment.location || 'N/A'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{t('select_truck').split(' ')[0]}</p>
                            <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{payment.truck_number} {payment.truck_model ? `(${payment.truck_model})` : ''}</p>
                        </div>

                        <div style={{ background: 'var(--color-success)10', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-success)', textTransform: 'uppercase' }}>{t('profit')}</p>
                            <p style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--color-success)' }}>₹{(Number(payment.profit) || 0).toLocaleString()}</p>
                        </div>
                        <div style={{ background: 'var(--color-error)10', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-error)', textTransform: 'uppercase' }}>{t('total_expense')}</p>
                            <p style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--color-error)' }}>₹{(Number(payment.total_expense) || 0).toLocaleString()}</p>
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>📝 {t('remark')}</p>
                            <p style={{ fontWeight: 600, fontSize: '0.8rem' }}>{payment.remark || 'N/A'}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', padding: '0 0.5rem' }}>
                        {payment.status !== 'received' && (
                            <Button
                                style={{
                                    width: '100%',
                                    background: 'var(--color-success)',
                                    color: '#fff',
                                    height: '3.5rem',
                                    fontSize: '1rem',
                                    fontWeight: 900
                                }}
                                onClick={() => navigate('/add-payment', {
                                    state: {
                                        tripId: payment.id,
                                        amount: payment.amount,
                                        clientName: payment.client
                                    }
                                })}
                            >
                                {t('received')}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            style={{
                                width: '100%',
                                height: '3.5rem',
                                fontSize: '1rem',
                                fontWeight: 900
                            }}
                            onClick={onClose}
                        >
                            {t('back')}
                        </Button>
                    </div>
                </Card>
            </div>
        );
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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-body)', position: 'relative' }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'uppercase' }}>{t('payments')}</h2>
                </div>
                <button
                    onClick={() => setIsFilterOpen(true)}
                    className="nb-shadow-sm" style={{
                        width: '2.75rem',
                        height: '2.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-bg-surface)',
                        border: 'var(--border-width) solid var(--color-border)',
                        cursor: 'pointer'
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontWeight: 900 }}>filter_list</span>
                </button>
            </div>

            <main style={{ flex: 1, padding: '1.25rem', overflowY: 'auto' }}>
                {/* Tabs */}
                <div className="nb-border" style={{
                    display: 'flex',
                    background: '#e2e8f0',
                    padding: '0.4rem',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: '1.5rem',
                    gap: '0.25rem'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                border: activeTab === tab.key ? 'var(--border-width) solid var(--color-border)' : 'none',
                                borderRadius: 'var(--radius-md)',
                                background: activeTab === tab.key ? 'var(--color-primary)' : 'transparent',
                                color: activeTab === tab.key ? '#fff' : 'var(--color-text-main)',
                                fontWeight: 800,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overdue Section */}
                {overduePayments.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase' }}>{t('overdue_payments')}</h3>
                            <span style={{
                                fontSize: '0.7rem',
                                fontWeight: 900,
                                border: '1px solid #ef4444',
                                color: '#ef4444',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px'
                            }}>{t('urgent')}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {overduePayments.map(p => (
                                <Card key={p.id} onClick={() => setSelectedPayment(p)} className="nb-shadow" style={{
                                    border: 'var(--border-width) solid #ef4444',
                                    padding: '1.25rem',
                                    background: 'var(--color-bg-surface)',
                                    boxShadow: 'var(--shadow-offset) var(--shadow-offset) 0 0 #ef4444',
                                    cursor: 'pointer'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('overdue')}</p>
                                            <h4 style={{ fontSize: '1.125rem', fontWeight: 800, marginTop: '0.25rem' }}>{p.client || 'Unknown Client'}</h4>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{t('select_truck').split(' ')[0]}: {p.truck_number}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 900 }}>₹{p.amount?.toLocaleString()}</p>
                                            <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#ef4444' }}>DUE: {new Date(p.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // WhatsApp logic here if needed
                                            }}
                                            className="nb-shadow-sm" style={{
                                                flex: 1,
                                                background: 'var(--color-primary)',
                                                color: '#fff',
                                                border: 'var(--border-width) solid var(--color-border)',
                                                borderRadius: 'var(--radius-md)',
                                                padding: '0.8rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                fontWeight: 800,
                                                fontSize: '1rem',
                                                cursor: 'pointer'
                                            }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>send</span>
                                            {t('remind_whatsapp')}
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main List Section */}
                <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--color-text-main)', textTransform: 'uppercase' }}>
                        {activeTab === 'Pending' ? t('tabs.pending') : activeTab === 'Received' ? t('tabs.received') : t('tabs.drafts')} {t('payments')}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {filteredPayments.filter(p => p.status !== 'overdue').map(p => (
                            <Card key={p.id} onClick={() => setSelectedPayment(p)} className="nb-shadow" style={{
                                padding: '1.25rem',
                                background: 'var(--color-bg-surface)',
                                cursor: 'pointer'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p style={{ fontSize: '0.65rem', fontWeight: 800, color: p.status === 'received' ? 'var(--color-success)' : 'var(--color-primary)', textTransform: 'uppercase' }}>
                                            {p.status === 'received' ? t('received') : t('pending')}
                                        </p>
                                        <h4 style={{ fontSize: '1.125rem', fontWeight: 800, marginTop: '0.25rem' }}>{p.client || 'Unknown Client'}</h4>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '0.85rem', verticalAlign: 'middle', marginRight: '0.25rem' }}>local_shipping</span>
                                            {p.truck_number}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 900 }}>₹{p.amount?.toLocaleString()}</p>
                                        <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{new Date(p.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}

                        {filteredPayments.length === 0 && (
                            <p style={{ textAlign: 'center', padding: '3rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                                {t('no_payments')}
                            </p>
                        )}
                    </div>
                </div>

                <div style={{ height: '10rem' }}></div>
            </main>

            {/* Sticky Footer */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'var(--color-bg-surface)',
                borderTop: 'var(--border-width) solid var(--color-border)',
                padding: '1rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 100
            }}>
                <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{t('total_pending')}</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 900 }}>₹{totalPending?.toLocaleString()}</p>
                </div>
                <button
                    onClick={() => navigate('/add-payment')}
                    className="nb-shadow"
                    style={{
                        background: 'var(--color-primary)',
                        color: '#fff',
                        border: 'var(--border-width) solid var(--color-border)',
                        padding: '1rem 1.5rem',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 800,
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                    }}
                >
                    {t('record_payment')}
                    <span className="material-symbols-outlined">add_circle</span>
                </button>
            </div>

            <FilterDrawer
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                setFilters={setFilters}
                onApply={handleApplyFilters}
            />

            {/* Detail Modal */}
            {selectedPayment && (
                <PaymentDetailModal
                    payment={selectedPayment}
                    onClose={() => setSelectedPayment(null)}
                />
            )}
        </div>
    );
};

export default PaymentList;
