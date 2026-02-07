import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import FilterDrawer from '../../components/ui/FilterDrawer';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth.jsx';
import { tripService } from '../../services/tripService';
import { truckService } from '../../services/truckService';
import { noticeService } from '../../services/noticeService';
import { paymentService } from '../../services/paymentService';
import { expenseService } from '../../services/expenseService';
import { fuelService } from '../../services/fuelService';
import { driverService } from '../../services/driverService';
import { supplierService } from '../../services/supplierService';
import { generatePDFReport, generateExcelReport } from '../../utils/reportUtils';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [trucks, setTrucks] = useState([]);
    const [selectedTruck, setSelectedTruck] = useState('all');
    const [notices, setNotices] = useState([]);
    const [allTrips, setAllTrips] = useState([]);
    const [allExpenses, setAllExpenses] = useState([]);
    const [allFuelExpenses, setAllFuelExpenses] = useState([]);
    const [allPayments, setAllPayments] = useState([]);
    const [allDrivers, setAllDrivers] = useState([]);
    const [allSuppliers, setAllSuppliers] = useState([]);
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
        const loadDashboardData = async () => {
            try {
                const [trucksData, tripsData, noticesData, expensesData, fuelData, paymentsData, driversData, suppliersData] = await Promise.all([
                    truckService.getMyTrucks(),
                    tripService.getMyTrips(),
                    noticeService.getMyNotices(),
                    expenseService.getMyExpenses(),
                    fuelService.getMyFuelExpenses(),
                    paymentService.getMyPayments(),
                    driverService.getMyDrivers(),
                    supplierService.getMySuppliers()
                ]);

                setTrucks(trucksData);
                setNotices(noticesData);
                setAllTrips(tripsData);
                setAllExpenses(expensesData);
                setAllFuelExpenses(fuelData);
                setAllPayments(paymentsData || []);
                setAllDrivers(driversData || []);
                setAllSuppliers(suppliersData || []);
            } catch (error) {
                console.error('Error loading dashboard:', error);
            }
        };
        loadDashboardData();
    }, []);

    // Memoized filtered data
    const filteredTrips = selectedTruck === 'all'
        ? allTrips
        : allTrips.filter(t => String(t.truck_id) === String(selectedTruck));

    const filteredExpenses = selectedTruck === 'all'
        ? allExpenses
        : allExpenses.filter(e => String(e.truck_id) === String(selectedTruck));

    const filteredFuelExpenses = selectedTruck === 'all'
        ? allFuelExpenses
        : allFuelExpenses.filter(f => String(f.truck_id) === String(selectedTruck));

    // Dynamic stats calculation
    const currentStats = {
        totalTrips: filteredTrips.length,
        totalEarnings: filteredTrips.reduce((acc, t) => acc + (Number(t.paid_amount) || 0), 0),
        pending: filteredTrips.reduce((acc, t) => {
            const tripAmount = Number(t.amount) || 0;
            const paidAmount = Number(t.paid_amount) || 0;
            return acc + (tripAmount - paidAmount);
        }, 0),
        fuelCost: filteredFuelExpenses.reduce((acc, f) => acc + (Number(f.amount) || 0), 0)
    };

    const currentRecentTrips = filteredTrips.slice(0, 5);

    // Get unique clients from trips for filter
    const uniqueClients = [...new Set(allTrips.map(t => t.client).filter(Boolean))];

    const daysRemaining = profile?.trial_expires_at
        ? Math.ceil((new Date(profile.trial_expires_at) - new Date()) / (1000 * 60 * 60 * 24))
        : 0;

    const handleDownloadReport = () => {
        if (!filters.format) {
            toast.error('Please select a report format (PDF or Excel) in filters first!');
            setIsFilterDrawerOpen(true);
            return;
        }

        toast.promise(
            (async () => {
                // Simulate preparation time for UX
                await new Promise(resolve => setTimeout(resolve, 1500));

                const applyDataFilters = (data, truckKey = 'truck_id', dateKey = 'expense_date') => {
                    let filtered = [...data];

                    // Filter by Truck
                    if (filters.truck !== 'all') {
                        filtered = filtered.filter(item => String(item[truckKey]) === String(filters.truck));
                    }

                    // Filter by Date Range
                    if (filters.dateRange !== 'yearly') {
                        const now = new Date();
                        const filterDate = new Date();
                        if (filters.dateRange === 'weekly') filterDate.setDate(now.getDate() - 7);
                        if (filters.dateRange === 'monthly') filterDate.setMonth(now.getMonth() - 1);
                        if (filters.dateRange === 'today') filterDate.setHours(0, 0, 0, 0);

                        if (filters.dateRange !== 'custom') {
                            filtered = filtered.filter(item => new Date(item[dateKey] || item.created_at) >= filterDate);
                        } else if (filters.startDate && filters.endDate) {
                            filtered = filtered.filter(item => {
                                const d = new Date(item[dateKey] || item.created_at);
                                return d >= new Date(filters.startDate) && d <= new Date(filters.endDate);
                            });
                        }
                    }
                    return filtered;
                };

                const reportData = {
                    trips: applyDataFilters(allTrips, 'truck_id', 'trip_date'),
                    fuelExpenses: applyDataFilters(allFuelExpenses, 'truck_id', 'expense_date'),
                    expenses: applyDataFilters(allExpenses, 'truck_id', 'expense_date'),
                    payments: applyDataFilters(allPayments, 'trip_id', 'created_at'),
                    drivers: allDrivers,
                    suppliers: allSuppliers
                };

                if (filters.format === 'pdf') {
                    generatePDFReport(reportData, filters, profile);
                } else if (filters.format === 'excel') {
                    generateExcelReport(reportData, filters);
                }
            })(),
            {
                loading: `Generating your professional ${filters.format.toUpperCase()} report...`,
                success: `${filters.format.toUpperCase()} Report generated successfully!`,
                error: 'Failed to generate report.',
            }
        );
    };

    const handleApplyFilters = () => {
        setIsFilterDrawerOpen(false);
    };

    const stats = [
        { label: t('total_trips'), value: currentStats.totalTrips?.toString() || '0', icon: 'local_shipping', color: 'var(--color-primary)' },
        { label: t('total_earnings'), value: `₹${currentStats.totalEarnings?.toLocaleString() || '0'}`, icon: 'payments', color: 'var(--color-success)' },
        { label: t('pending'), value: `₹${currentStats.pending?.toLocaleString() || '0'}`, icon: 'pending_actions', color: 'var(--color-warning)' },
        { label: t('fuel_cost'), value: `₹${currentStats.fuelCost?.toLocaleString() || '0'}`, icon: 'local_gas_station', color: 'var(--color-error)' },
    ];

    const actions = [
        { label: t('add_trip'), icon: 'add_road', path: '/add-trip' },
        { label: t('payments'), icon: 'attach_money', path: '/add-payment' },
        { label: t('truck_expenses'), icon: 'build', path: '/expenses' },
        { label: t('reminders'), icon: 'alarm', path: '/add-reminder' },
    ];

    // Dynamic Weekly Earnings Data
    const getWeeklyEarnings = () => {
        const labels = [];
        const data = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);

            // Generate local date string for comparison (YYYY-MM-DD)
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const localDateStr = `${year}-${month}-${day}`;

            const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
            labels.push(dayLabel);

            // Sum trips for this day using local date comparison
            const daySum = filteredTrips
                .filter(t => {
                    if (!t.trip_date) return false;
                    const tripD = new Date(t.trip_date);
                    const tYear = tripD.getFullYear();
                    const tMonth = String(tripD.getMonth() + 1).padStart(2, '0');
                    const tDay = String(tripD.getDate()).padStart(2, '0');
                    const tLocalDateStr = `${tYear}-${tMonth}-${tDay}`;
                    return tLocalDateStr === localDateStr;
                })
                .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
            data.push(daySum);
        }
        return { labels, data };
    };

    const weeklyData = getWeeklyEarnings();

    const chartData = {
        labels: weeklyData.labels,
        datasets: [
            {
                label: `${t('total_earnings')} (₹)`,
                data: weeklyData.data,
                backgroundColor: 'rgba(19, 127, 236, 0.8)',
                borderColor: '#111418',
                borderWidth: 2,
                borderRadius: 4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            x: { grid: { display: false } },
            y: { grid: { display: false } },
        }
    };

    // Dynamic Expense Breakdown
    const getExpenseBreakdown = () => {
        let fuel = 0;
        let maintenance = 0;
        let salary = 0;
        let Misc = 0;

        // Fuel from Actual Fuel Logs
        fuel = filteredFuelExpenses.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

        // Expenses from Expense Service
        filteredExpenses.forEach(e => {
            const amount = Number(e.amount) || 0;
            const cat = e.category || 'Other';
            if (['Tyre', 'Repair', 'Service'].includes(cat)) {
                maintenance += amount;
            } else if (cat === 'Salary') {
                salary += amount;
            } else {
                Misc += amount;
            }
        });

        return [fuel, maintenance, salary, Misc];
    };

    const expenseData = {
        labels: [t('fuel_logs'), t('maintenance'), t('driver_salary'), t('toll_misc')],
        datasets: [
            {
                data: getExpenseBreakdown(),
                backgroundColor: [
                    '#ef4444', // Fuel (Red)
                    '#f59e0b', // Maintenance (Amber)
                    '#10b981', // Salary (Emerald)
                    '#6366f1', // Misc (Indigo)
                ],
                borderColor: 'var(--color-border)',
                borderWidth: 2,
            },
        ],
    };

    const pieOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: { weight: 'bold', family: 'Inter' },
                    padding: 20,
                    usePointStyle: true,
                    color: 'var(--color-text-main)'
                }
            }
        },
    };

    return (
        <>
            <main style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Notice Banner */}
                <div className="nb-border" style={{
                    padding: '1rem',
                    background: 'var(--color-warning)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontWeight: 800
                }}>
                    <span className="material-symbols-outlined">campaign</span>
                    <p style={{ fontSize: '0.875rem' }}>{notices.length > 0 ? notices[0].content : t('welcome_notice')}</p>
                </div>

                {/* Header Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{t('welcome_back')}</p>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.2 }}>{profile?.full_name || 'Owner'}</h1>
                    </div>
                    {/* Trial Status */}
                    <div className="nb-border" style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        background: '#fff',
                        textAlign: 'right',
                        minWidth: 'fit-content'
                    }}>
                        <p style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                            {t('trial_ends')}: {profile?.trial_expires_at ? new Date(profile.trial_expires_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A'}
                        </p>
                        <p style={{ fontSize: '0.875rem', fontWeight: 900, color: daysRemaining <= 0 ? 'var(--color-error)' : 'var(--color-primary)' }}>
                            {daysRemaining <= 0 ? t('expired').toUpperCase() : `${daysRemaining} ${t('days_left')}`}
                        </p>
                    </div>
                </div>

                <div style={{ position: 'sticky', top: '0.5rem', zIndex: 10 }}>
                    <Select
                        options={[
                            { value: 'all', label: t('all_trucks_view') },
                            ...trucks.map(t => ({ value: t.id, label: t.truck_number }))
                        ]}
                        value={selectedTruck}
                        onChange={(e) => setSelectedTruck(e.target.value)}
                        placeholder={t('all_trucks')}
                    />
                </div>

                {/* Enhanced Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.25rem'
                }}>
                    {stats.map((stat, idx) => (
                        <Card key={idx} noPadding className="nb-shadow" style={{
                            padding: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                            borderTop: `6px solid ${stat.color}`,
                            transition: 'transform 0.2s',
                            boxShadow: '4px 4px 0 0 var(--color-border)'
                        }}>
                            <div style={{
                                width: '2rem', height: '2rem',
                                background: `${stat.color}20`,
                                borderRadius: '0.5rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <span className="material-symbols-outlined" style={{ color: stat.color, fontSize: '1.25rem' }}>{stat.icon}</span>
                            </div>
                            <div>
                                <p style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1 }}>{stat.value}</p>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>{stat.label}</p>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions (Compact) */}
                <Card className="nb-shadow-sm" style={{ padding: '1rem' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--color-text-muted)' }}>{t('quick_shortcuts')}</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '0.5rem'
                    }}>
                        {actions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => navigate(action.path)}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                    background: 'none', border: 'none', cursor: 'pointer'
                                }}
                            >
                                <div className="nb-border" style={{
                                    width: '3rem', height: '3rem', borderRadius: '1rem',
                                    background: 'var(--color-bg-surface)',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    boxShadow: '2px 2px 0px 0px var(--color-border)'
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>{action.icon}</span>
                                </div>
                                <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>{action.label}</span>
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Analytics Section */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 900, textTransform: 'uppercase' }}>{t('analytics')}</h3>
                        <Button variant="outline" size="sm" onClick={() => navigate('/settings')} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>{t('view_more')}</Button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <Card className="nb-shadow-sm">
                            <h4 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '0.875rem' }}>{t('weekly_earnings')}</h4>
                            <Bar options={chartOptions} data={chartData} />
                        </Card>

                        <Card className="nb-shadow-sm">
                            <h4 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '0.875rem' }}>{t('expense_breakdown')}</h4>
                            <div style={{ padding: '0 2rem' }}>
                                <Pie options={pieOptions} data={expenseData} />
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Reports & Downloads (NEW SECTION - Split Design) */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                    <button
                        onClick={handleDownloadReport}
                        className="nb-shadow"
                        style={{
                            width: '90%',
                            height: '4rem',
                            background: 'var(--color-primary)',
                            color: '#fff',
                            border: '2px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            fontWeight: 900,
                            fontSize: '1.125rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                        }}
                    >
                        <span className="material-symbols-outlined">download</span>
                        {t('download_report')}
                    </button>
                    <button
                        onClick={() => setIsFilterDrawerOpen(true)}
                        className="nb-shadow"
                        style={{
                            width: '10%',
                            minWidth: '4rem',
                            background: '#fff',
                            color: 'var(--color-primary)',
                            border: '2px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontWeight: 900 }}>tune</span>
                    </button>
                </div>

                <FilterDrawer
                    isOpen={isFilterDrawerOpen}
                    onClose={() => setIsFilterDrawerOpen(false)}
                    onApply={handleApplyFilters}
                    filters={filters}
                    setFilters={setFilters}
                    trucks={trucks}
                    suppliers={allSuppliers}
                    clients={uniqueClients}
                />

                {/* Recent Activity */}
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>{t('recent_history')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {currentRecentTrips.length > 0 ? currentRecentTrips.map(trip => (
                            <div key={trip.id} className="nb-border" style={{
                                padding: '1rem',
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--color-bg-surface)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '2px 2px 0 0 var(--color-border)'
                            }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{
                                        width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)',
                                        background: 'rgba(19, 127, 236, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)'
                                    }}>
                                        <span className="material-symbols-outlined">local_shipping</span>
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 800, fontSize: '0.875rem' }}>{trip.material} Trip - {trip.location || 'Site'}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                                            {new Date(trip.trip_date).toLocaleDateString()} • {trip.truck_number}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontWeight: 900, color: 'var(--color-success)' }}>+ ₹{trip.amount?.toLocaleString()}</p>
                                </div>
                            </div>
                        )) : (
                            <p style={{ textAlign: 'center', fontWeight: 700, color: 'var(--color-text-muted)', padding: '2rem' }}>{t('no_recent_trips')}</p>
                        )}
                    </div>
                </div>

                <div style={{ height: '5rem' }}></div>
            </main>
        </>
    );
};

export default Dashboard;
