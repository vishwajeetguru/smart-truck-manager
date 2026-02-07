import React from 'react';
import Button from './Button';
import Accordion from './Accordion';
import Select from './Select';
import Input from './Input';
import DatePicker from './DatePicker';

const FilterDrawer = ({ isOpen, onClose, onApply, filters, setFilters, trucks = [], suppliers = [], clients = [] }) => {
    if (!isOpen) return null;

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
        }}>
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.7)', // Darker backdrop
                    backdropFilter: 'blur(8px)' // Stronger blur
                }}
            />

            <div className="nb-shadow" style={{
                position: 'relative',
                width: '85%',
                maxWidth: '400px',
                height: '100%',
                background: '#fff', // Solid white background
                borderLeft: '4px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideIn 0.3s ease-out',
                boxShadow: '-10px 0 0 rgba(0,0,0,0.1)'
            }}>
                <style>
                    {`
                        @keyframes slideIn {
                            from { transform: translateX(100%); }
                            to { transform: translateX(0); }
                        }
                    `}
                </style>

                <div style={{
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '4px solid var(--color-border)',
                    background: 'var(--color-primary)',
                    color: '#fff'
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase' }}>Filters</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '2rem', fontWeight: 900 }}>close</span>
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'var(--color-bg-main)' }}>
                    <Accordion title="Report Format (Mandatory)" defaultOpen={true}>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="format"
                                    value="pdf"
                                    checked={filters.format === 'pdf'}
                                    onChange={handleChange}
                                    style={{ width: '1.5rem', height: '1.5rem', accentColor: 'var(--color-primary)' }}
                                />
                                <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>PDF</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="format"
                                    value="excel"
                                    checked={filters.format === 'excel'}
                                    onChange={handleChange}
                                    style={{ width: '1.5rem', height: '1.5rem', accentColor: 'var(--color-primary)' }}
                                />
                                <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>Excel</span>
                            </label>
                        </div>
                    </Accordion>

                    <Accordion title="Date Range">
                        <Select
                            name="dateRange"
                            value={filters.dateRange}
                            onChange={handleChange}
                            options={[
                                { value: 'today', label: 'Today' },
                                { value: 'weekly', label: 'Past Week' },
                                { value: 'monthly', label: 'Past Month' },
                                { value: 'yearly', label: 'Full Year' },
                                { value: 'custom', label: 'Custom Range' }
                            ]}
                        />
                        {filters.dateRange === 'custom' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                <DatePicker
                                    label="From Date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleChange}
                                />
                                <DatePicker
                                    label="To Date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                    </Accordion>

                    <Accordion title="Select Truck">
                        <Select
                            name="truck"
                            value={filters.truck}
                            onChange={handleChange}
                            options={[
                                { value: 'all', label: 'All Trucks' },
                                ...trucks.map(t => ({ value: t.id, label: t.truck_number }))
                            ]}
                        />
                    </Accordion>

                    <Accordion title="Client (Order By)">
                        <Select
                            name="client"
                            value={filters.client}
                            onChange={handleChange}
                            options={[
                                { value: 'all', label: 'All Clients' },
                                ...clients.map(c => ({ value: c, label: c }))
                            ]}
                        />
                    </Accordion>

                    <Accordion title="Supplier">
                        <Select
                            name="supplier"
                            value={filters.supplier}
                            onChange={handleChange}
                            options={[
                                { value: 'all', label: 'All Suppliers' },
                                ...suppliers.map(s => ({ value: s.id, label: s.name }))
                            ]}
                        />
                    </Accordion>
                </div>

                <div style={{
                    padding: '1.5rem',
                    borderTop: '4px solid var(--color-border)',
                    gap: '1rem',
                    display: 'flex',
                    background: '#fff',
                    zIndex: 20
                }}>
                    <button
                        className="nb-button"
                        onClick={onClose}
                        style={{
                            flex: 1,
                            height: '3.5rem',
                            background: '#eee',
                            color: '#000',
                            fontWeight: 800,
                            borderRadius: 'var(--radius-md)',
                            border: '2px solid var(--color-border)',
                            boxShadow: '4px 4px 0 0 var(--color-border)'
                        }}
                    >
                        CANCEL
                    </button>
                    <button
                        className="nb-button"
                        onClick={onApply}
                        style={{
                            flex: 1,
                            height: '3.5rem',
                            background: 'var(--color-primary)',
                            color: '#fff',
                            fontWeight: 800,
                            borderRadius: 'var(--radius-md)',
                            border: '2px solid var(--color-border)',
                            boxShadow: '4px 4px 0 0 var(--color-border)'
                        }}
                    >
                        APPLY FILTERS
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterDrawer;
