import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/ui/Card';
import { expenseService } from '../../services/expenseService';

const ExpenseList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                setLoading(true);
                const data = await expenseService.getMyExpenses();
                setExpenses(data || []);
            } catch (error) {
                console.error('Error fetching expenses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchExpenses();
    }, []);

    const getTotalExpenses = () => {
        return expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg-body)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '3.5rem',
                        height: '3.5rem',
                        border: '5px solid var(--color-primary)',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        margin: '0 auto 1.5rem',
                        animation: 'spin 1.2s linear infinite'
                    }}></div>
                    <p style={{ fontWeight: 900, color: 'var(--color-text-main)', fontSize: '1.125rem', textTransform: 'uppercase' }}>{t('loading_details')}</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-body)' }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'var(--color-bg-surface)', borderBottom: '2px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 20 }}>
                <button onClick={() => navigate('/dashboard')} className="nb-shadow-sm" style={{
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
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{t('truck_expenses')}</h2>
            </div>

            <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
                {/* Summary Card - Revamped */}
                <div className="nb-shadow" style={{
                    marginBottom: '2rem',
                    padding: '1.75rem',
                    background: 'white',
                    borderRadius: 'var(--radius-lg)',
                    border: '3px solid black',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '8px',
                        height: '100%',
                        background: 'var(--color-error)'
                    }}></div>
                    <p style={{
                        fontSize: '0.875rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        color: 'var(--color-text-muted)',
                        letterSpacing: '0.1em'
                    }}>{t('total_expenses')}</p>
                    <p style={{
                        fontSize: '2.75rem',
                        fontWeight: 900,
                        color: 'var(--color-error)',
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '0.25rem'
                    }}>
                        <span style={{ fontSize: '1.75rem' }}>₹</span>
                        {getTotalExpenses().toLocaleString()}
                    </p>
                </div>

                {/* Expense List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {expenses.length > 0 ? expenses.map((expense) => (
                        <Card key={expense.id} className="nb-shadow-sm" style={{
                            padding: '1.25rem',
                            background: 'white',
                            border: '2px solid black',
                            borderRadius: 'var(--radius-lg)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '1.125rem', alignItems: 'center' }}>
                                    <div style={{
                                        width: '3.5rem',
                                        height: '3.5rem',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--color-error)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        border: '2px solid black',
                                        boxShadow: '2px 2px 0px black'
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>
                                            {expense.category?.toLowerCase() === 'repair' ? 'build' :
                                                expense.category?.toLowerCase() === 'tyre' ? 'tire_repair' :
                                                    expense.category?.toLowerCase() === 'service' ? 'settings' : 'payments'}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.125rem', fontWeight: 900, marginBottom: '0.25rem', textTransform: 'uppercase' }}>{expense.category}</h4>
                                        <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                                            {new Date(expense.expense_date).toLocaleDateString()} • <span style={{ color: 'var(--color-primary)' }}>{expense.truck_number}</span>
                                        </p>
                                        {expense.description && (
                                            <p style={{
                                                fontSize: '0.8125rem',
                                                color: 'var(--color-text-muted)',
                                                marginTop: '0.4rem',
                                                fontStyle: 'italic',
                                                background: '#f8fafc',
                                                padding: '0.4rem 0.6rem',
                                                borderRadius: '4px',
                                                border: '1px solid #e2e8f0'
                                            }}>{expense.description}</p>
                                        )}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{
                                        fontSize: '1.25rem',
                                        fontWeight: 900,
                                        color: 'var(--color-error)',
                                        letterSpacing: '-0.01em'
                                    }}>-₹{Number(expense.amount).toLocaleString()}</p>
                                </div>
                            </div>
                        </Card>
                    )) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '5rem 2rem',
                            background: 'white',
                            borderRadius: 'var(--radius-lg)',
                            border: '3px dashed var(--color-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1.5rem'
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--color-text-muted)', opacity: 0.3 }}>receipt_long</span>
                            <p style={{ fontWeight: 800, color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>
                                {t('no_expenses_recorded')}
                            </p>
                            <Button onClick={() => navigate('/add-expense')} variant="outline" size="sm">
                                {t('add_expense')}
                            </Button>
                        </div>
                    )}
                </div>

                <div style={{ height: '7rem' }}></div>
            </main>

            {/* Floating Action Button - Enhanced */}
            <button
                onClick={() => navigate('/add-expense')}
                className="nb-shadow"
                style={{
                    position: 'fixed',
                    bottom: '2.5rem',
                    right: '1.5rem',
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '1.5rem',
                    background: 'var(--color-error)',
                    color: '#fff',
                    border: '3px solid black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 100,
                    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', fontWeight: 900 }}>add</span>
            </button>
        </div>
    );
};

export default ExpenseList;
