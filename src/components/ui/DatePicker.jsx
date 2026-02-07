import React, { useState, useRef, useEffect } from 'react';

const DatePicker = ({ label, value, onChange, placeholder = 'Select Date', fullWidth = true, name }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Initial date state
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
        return new Date(year, month, 1).getDay();
    };

    const handleDateClick = (day) => {
        // Format: YYYY-MM-DD
        const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onChange({ target: { name, value: formattedDate } });
        setIsOpen(false);
    };

    const changeMonth = (offset) => {
        let newMonth = currentMonth + offset;
        let newYear = currentYear;
        if (newMonth > 11) {
            newMonth = 0;
            newYear += 1;
        } else if (newMonth < 0) {
            newMonth = 11;
            newYear -= 1;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} style={{ width: '2rem', height: '2rem' }}></div>);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = value === dateStr;
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

            days.push(
                <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    style={{
                        width: '2rem',
                        height: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontWeight: 700,
                        backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                        color: isSelected ? '#fff' : (isToday ? 'var(--color-primary)' : 'var(--color-text-main)'),
                        borderRadius: '0.25rem',
                        border: isToday && !isSelected ? '2px solid var(--color-primary)' : 'none'
                    }}
                    onMouseEnter={(e) => !isSelected && (e.target.style.backgroundColor = 'rgba(0,0,0,0.05)')}
                    onMouseLeave={(e) => !isSelected && (e.target.style.backgroundColor = 'transparent')}
                >
                    {day}
                </div>
            );
        }
        return days;
    };

    return (
        <div
            ref={containerRef}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                width: fullWidth ? '100%' : 'auto',
                position: 'relative'
            }}
        >
            {label && (
                <label style={{
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {label}
                </label>
            )}

            <div
                className="nb-border"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '1rem',
                    backgroundColor: 'var(--color-bg-surface)',
                    color: value ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                    boxShadow: isOpen ? '2px 2px 0px 0px var(--color-border)' : 'var(--shadow-offset) var(--shadow-offset) 0px 0px var(--color-border)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transform: isOpen ? 'translate(2px, 2px)' : 'none',
                    transition: 'all 0.1s'
                }}
            >
                <span style={{ fontWeight: 600 }}>{value || placeholder}</span>
                <span className="material-symbols-outlined">calendar_today</span>
            </div>

            {isOpen && (
                <div className="nb-border" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    zIndex: 100,
                    marginTop: '0.5rem',
                    padding: '1rem',
                    backgroundColor: 'var(--color-bg-surface)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-offset) var(--shadow-offset) 0px 0px var(--color-border)',
                    width: '300px' // Fixed width for calendar to avoid squashing
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <span style={{ fontWeight: 800 }}>{months[currentMonth]} {currentYear}</span>
                        <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', marginBottom: '0.5rem' }}>
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <span key={day} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{day}</span>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                        {renderCalendar()}
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                        <button
                            onClick={() => { onChange({ target: { name, value: '' } }); setIsOpen(false); }}
                            style={{ background: 'none', border: 'none', color: 'var(--color-error)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
                        >
                            Clear
                        </button>
                        <button
                            onClick={() => {
                                const t = new Date();
                                const dateStr = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
                                onChange({ target: { name, value: dateStr } });
                                setIsOpen(false);
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
                        >
                            Today
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};

export default DatePicker;
