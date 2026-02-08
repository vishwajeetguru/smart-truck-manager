import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/ui/Card';
import { materialService } from '../../services/materialService';
import { toast } from 'react-hot-toast';

const MaterialList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const data = await materialService.getMyMaterials();
            setMaterials(data || []);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('confirm_delete_material'))) {
            try {
                await materialService.deleteMaterial(id);
                setMaterials(materials.filter(m => m.id !== id));
                toast.success('Material deleted successfully');
            } catch (error) {
                toast.error(t('failed_delete_material'));
            }
        }
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
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{t('materials')}</h2>
            </div>

            <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
                {/* Material List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {materials.length > 0 ? materials.map((material) => (
                        <Card key={material.id} className="nb-shadow-sm" style={{
                            padding: '1.25rem',
                            background: 'white',
                            border: '2px solid black',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', gap: '1.125rem', alignItems: 'center' }}>
                                <div style={{
                                    width: '3.5rem',
                                    height: '3.5rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--color-bg-body)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--color-text-main)',
                                    border: '2px solid black',
                                    boxShadow: '2px 2px 0px black'
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.75rem', fontWeight: 900 }}>
                                        {material.name?.toLowerCase().includes('sand') ? 'grain' :
                                            material.name?.toLowerCase().includes('mm') ? 'grid_view' :
                                                material.name?.toLowerCase().includes('murum') ? 'landscape' : 'inventory_2'}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text-main)', textTransform: 'capitalize' }}>{material.name}</h3>
                            </div>
                            <button
                                onClick={() => handleDelete(material.id)}
                                className="nb-shadow-sm"
                                style={{
                                    background: 'white',
                                    color: 'var(--color-error)',
                                    border: '2px solid black',
                                    borderRadius: 'var(--radius-md)',
                                    width: '2.75rem',
                                    height: '2.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontWeight: 900 }}>delete</span>
                            </button>
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
                            <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--color-text-muted)', opacity: 0.3 }}>category</span>
                            <p style={{ fontWeight: 800, color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>
                                {t('no_materials_found')}
                            </p>
                            <Button onClick={() => navigate('/add-material')} variant="outline" size="sm">
                                {t('add_material')}
                            </Button>
                        </div>
                    )}
                </div>
                <div style={{ height: '7rem' }}></div>
            </main>

            {/* Floating Action Button - Enhanced */}
            <button
                onClick={() => navigate('/add-material')}
                className="nb-shadow"
                style={{
                    position: 'fixed',
                    bottom: '2.5rem',
                    right: '1.5rem',
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '1.5rem',
                    background: 'var(--color-primary)',
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

export default MaterialList;
