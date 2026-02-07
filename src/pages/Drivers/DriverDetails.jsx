import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { driverService } from '../../services/driverService';
import { toast } from 'react-hot-toast';

const DriverDetails = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [driver, setDriver] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_type: 'salary',
        remark: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [driverData, paymentsData] = await Promise.all([
                    driverService.getDriver(id),
                    driverService.getDriverPayments(id)
                ]);
                setDriver(driverData);
                setPayments(paymentsData);
            } catch (error) {
                console.error('Failed to fetch driver details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleAddPayment = async (e) => {
        e.preventDefault();
        if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
            toast.error(t('please_enter_valid_amount'));
            return;
        }
        try {
            await driverService.addDriverPayment(id, {
                ...paymentForm,
                amount: parseFloat(paymentForm.amount)
            });
            setIsPaymentModalOpen(false);
            setPaymentForm({
                amount: '',
                payment_date: new Date().toISOString().split('T')[0],
                payment_type: 'salary',
                remark: ''
            });
            // Refresh data
            const paymentsData = await driverService.getDriverPayments(id);
            setPayments(paymentsData);
            toast.success('Payment recorded successfully');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg-body)' }}>
                <p style={{ fontWeight: 800 }}>{t('loading_details')}</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-body)' }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-bg-surface)', borderBottom: '2px solid var(--color-border)' }}>
                <button onClick={() => navigate('/drivers')} className="nb-shadow-sm" style={{
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
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{driver?.name}</h2>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{t('driver_profile_ledger')}</p>
                </div>
                <button
                    onClick={() => navigate(`/edit-driver/${id}`)}
                    className="nb-shadow-sm"
                    style={{
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
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontWeight: 900 }}>edit</span>
                </button>
            </div>

            <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
                {/* Stats Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <Card className="nb-shadow" style={{ padding: '1.25rem', background: 'var(--color-bg-surface)', border: '2px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>account_balance_wallet</span>
                            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{t('monthly_salary')}</p>
                        </div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 900 }}>₹{driver?.salary?.toLocaleString() || 0}</p>
                    </Card>
                    <Card className="nb-shadow" style={{ padding: '1.25rem', background: 'var(--color-bg-surface)', border: '2px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--color-success)' }}>check_circle</span>
                            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{t('total_paid')}</p>
                        </div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-success)' }}>₹{totalPaid.toLocaleString()}</p>
                    </Card>
                </div>

                {/* Driver Info Quick View */}
                <Card className="nb-shadow" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'var(--color-bg-surface)', border: '2px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px dashed var(--color-border)' }}>
                        <span className="material-symbols-outlined" style={{ fontWeight: 900 }}>contact_page</span>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('quick_details')}</h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>badge</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{t('license')}</span>
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 900 }}>{driver?.license_number || t('not_available')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>call</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{t('mobile')}</span>
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 900 }}>{driver?.mobile_primary || t('not_available')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>bloodtype</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{t('blood_group')}</span>
                            </div>
                            <span style={{
                                fontSize: '0.8rem',
                                fontWeight: 900,
                                background: 'var(--color-error)',
                                color: '#fff',
                                padding: '0.1rem 0.6rem',
                                borderRadius: '1rem',
                                border: '1px solid var(--color-border)'
                            }}>{driver?.blood_group || t('not_available')}</span>
                        </div>
                    </div>
                </Card>

                {/* Payment History */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span className="material-symbols-outlined" style={{ fontWeight: 900, color: 'var(--color-primary)' }}>receipt_long</span>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase' }}>{t('ledger_records')}</h3>
                    </div>
                    <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="nb-button"
                        style={{
                            background: 'var(--color-primary)',
                            color: '#fff',
                            fontSize: '0.8rem',
                            padding: '0.6rem 1rem',
                            boxShadow: 'var(--shadow-offset) var(--shadow-offset) 0px 0px var(--color-border)'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', marginRight: '0.4rem', fontWeight: 900 }}>add</span>
                        {t('amount')}
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {payments.map(p => (
                        <Card key={p.id} className="nb-shadow-sm" style={{ padding: '1.25rem', background: 'var(--color-bg-surface)', border: '2px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '2.5rem',
                                        height: '2.5rem',
                                        borderRadius: 'var(--radius-md)',
                                        background: p.payment_type === 'salary' ? 'rgba(34, 197, 94, 0.1)' :
                                            p.payment_type === 'advance' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(19, 127, 236, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid var(--color-border)'
                                    }}>
                                        <span className="material-symbols-outlined" style={{
                                            fontSize: '1.25rem',
                                            color: p.payment_type === 'salary' ? 'var(--color-success)' :
                                                p.payment_type === 'advance' ? 'var(--color-accent)' : 'var(--color-primary)',
                                            fontWeight: 900
                                        }}>
                                            {p.payment_type === 'salary' ? 'payments' : p.payment_type === 'advance' ? 'trending_up' : 'stars'}
                                        </span>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 900 }}>₹{parseFloat(p.amount).toLocaleString()}</p>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginTop: '0.1rem' }}>
                                            {new Date(p.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        fontSize: '0.65rem',
                                        fontWeight: 900,
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '0.4rem',
                                        background: 'var(--color-bg-body)',
                                        border: '1px solid var(--color-border)',
                                        textTransform: 'uppercase'
                                    }}>
                                        {p.payment_type === 'salary' ? t('salary') : p.payment_type === 'advance' ? t('advance') : p.payment_type === 'bonus' ? t('bonus') : t('other')}
                                    </span>
                                    {p.remark && (
                                        <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)', marginTop: '0.4rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {p.remark}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                    {payments.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--color-border)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--color-text-muted)', opacity: 0.3, marginBottom: '0.5rem' }}>history_toggle_off</span>
                            <p style={{ color: 'var(--color-text-muted)', fontWeight: 800, fontSize: '0.9rem' }}>{t('no_payment_records')}</p>
                            <p style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.75rem', marginTop: '0.25rem' }}>{t('start_ledger_instruction')}</p>
                        </div>
                    )}
                </div>

                <div style={{ height: '4rem' }}></div>
            </main>

            {/* Add Payment Modal */}
            {isPaymentModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'flex-end'
                }}>
                    <div className="nb-shadow" style={{
                        width: '100%',
                        background: 'var(--color-bg-surface)',
                        borderTopLeftRadius: '2rem',
                        borderTopRightRadius: '2rem',
                        padding: '2rem 1.5rem',
                        border: 'var(--border-width) solid var(--color-border)',
                        borderBottom: 'none'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>{t('record_payment').toUpperCase()}</h3>
                            <button onClick={() => setIsPaymentModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <Input
                                label={t('amount')}
                                type="number"
                                value={paymentForm.amount}
                                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                placeholder={t('enter_amount_paid')}
                                required
                            />
                            <Input
                                label={t('date')}
                                type="date"
                                value={paymentForm.payment_date}
                                onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                                required
                            />
                            <Select
                                label={t('expense_type')}
                                value={paymentForm.payment_type}
                                onChange={(e) => setPaymentForm({ ...paymentForm, payment_type: e.target.value })}
                                options={[
                                    { value: 'salary', label: t('monthly_salary') },
                                    { value: 'advance', label: t('advance') },
                                    { value: 'bonus', label: t('bonus') },
                                    { value: 'other', label: t('other') }
                                ]}
                            />
                            <Input
                                label={t('remark')}
                                value={paymentForm.remark}
                                onChange={(e) => setPaymentForm({ ...paymentForm, remark: e.target.value })}
                                placeholder={t('any_notes')}
                            />
                            <Button onClick={handleAddPayment} style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}>
                                {t('save_payment_record')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverDetails;
