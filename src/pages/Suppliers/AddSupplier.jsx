import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { supplierService } from '../../services/supplierService';
import { toast } from 'react-hot-toast';

const AddSupplier = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        mobile: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!formData.name || !formData.mobile) {
            toast.error(t('please_enter_supplier_name_mobile'));
            return;
        }

        setLoading(true);
        try {
            await supplierService.addSupplier(formData);
            toast.success(t('added_successfully', 'Added successfully!'));
            navigate(-1); // Go back to where we came from (Supplier List or Trip Form)
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-body)' }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' }}>
                <button onClick={() => navigate(-1)} className="nb-shadow-sm" style={{
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'uppercase' }}>{t('add_supplier')}</h2>
            </div>

            <main style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Input
                    label={t('supplier_name')}
                    name="name"
                    placeholder={t('supplier_name_placeholder')}
                    value={formData.name}
                    onChange={handleChange}
                />

                <Input
                    label={t('mobile')}
                    name="mobile"
                    type="tel"
                    placeholder={t('mobile_placeholder')}
                    value={formData.mobile}
                    onChange={handleChange}
                />

                <Input
                    label={t('address')}
                    name="address"
                    placeholder={t('address_placeholder')}
                    value={formData.address}
                    onChange={handleChange}
                />

                <div style={{ marginTop: 'auto' }}>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="nb-shadow"
                        style={{
                            width: '100%',
                            padding: '1.25rem',
                            background: loading ? 'var(--color-bg-surface)' : 'var(--color-primary)',
                            color: loading ? 'var(--color-text-muted)' : '#fff',
                            border: 'var(--border-width) solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 900,
                            fontSize: '1.25rem',
                            textTransform: 'uppercase',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? t('saving') : t('add')}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default AddSupplier;
