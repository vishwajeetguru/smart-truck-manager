import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { noticeService } from '../../services/noticeService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DatePicker from '../../components/ui/DatePicker';
import Card from '../../components/ui/Card';
import { toast } from 'react-hot-toast';

const Reminders = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        content: '',
        scheduled_for: new Date().toISOString().split('T')[0]
    });

    const fetchNotices = async () => {
        try {
            const data = await noticeService.getMyNotices();
            setNotices(data);
        } catch (error) {
            console.error('Error fetching notices:', error);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleSave = async () => {
        if (!formData.content) {
            toast.error(t('please_enter_content'));
            return;
        }
        setLoading(true);
        try {
            await noticeService.createNotice(formData);
            toast.success(t('reminder_set_success'));
            setFormData({ content: '', scheduled_for: new Date().toISOString().split('T')[0] });
            fetchNotices();
        } catch (error) {
            toast.error(t('failed_to_set_reminder'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await noticeService.deleteNotice(id);
            toast.success(t('deleted'));
            fetchNotices();
        } catch (error) {
            toast.error(t('delete_failed'));
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-body)' }}>
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'uppercase' }}>{t('reminders')}</h2>
            </div>

            <main style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
                <Input
                    label={t('add_new_reminder')}
                    placeholder={t('reminder_placeholder')}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
                <DatePicker
                    label={t('select_date')}
                    value={formData.scheduled_for}
                    onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                />
                <Button fullWidth loading={loading} onClick={handleSave} style={{ height: '3.5rem' }}>{t('set_reminder')}</Button>

                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--color-text-main)', textTransform: 'uppercase' }}>{t('upcoming')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {notices.map(notice => (
                            <Card key={notice.id} noPadding style={{ padding: '1rem', background: 'var(--color-bg-surface)' }} className="nb-shadow-sm">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 800, color: 'var(--color-text-main)', fontSize: '0.875rem' }}>{notice.content}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                                            {new Date(notice.scheduled_for || notice.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button onClick={() => handleDelete(notice.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}>
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Reminders;
