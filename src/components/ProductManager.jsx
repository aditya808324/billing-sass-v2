import { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { Plus, Trash2, Search } from 'lucide-react';

const ProductManager = () => {
    const { products, addProduct, deleteProduct } = useProducts();
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        gst_rate: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.price) return;

        setIsLoading(true);
        try {
            await addProduct({
                name: formData.name,
                price: parseFloat(formData.price),
                category: formData.category || 'General',
                gst_rate: parseFloat(formData.gst_rate) || 0
            });

            setFormData({ name: '', price: '', category: '', gst_rate: '' });
            setShowModal(false);
        } catch (err) {
            console.error(err);
            setError('Failed to save product. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center bg-card p-4 rounded-xl card">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '2.5rem', width: '100%' }}
                        />
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {/* Grid List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {filteredProducts.map(product => (
                    <div key={product.id} className="card flex flex-col gap-2 relative group">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl">{product.name}</h3>
                                <span className="text-sm bg-surface px-2 py-1 rounded border border-subtle">
                                    {product.category || 'General'}
                                </span>
                            </div>
                            <span className="text-2xl font-bold" style={{ color: 'var(--success)' }}>
                                ₹{Number(product.price).toFixed(2)}
                            </span>
                        </div>

                        <div className="mt-4 flex justify-between items-center text-sm">
                            <span className="text-gray-400">
                                GST: {product.gst_rate}%
                            </span>
                            <button
                                className="text-danger p-2 hover:bg-surface rounded-full transition-colors"
                                onClick={() => deleteProduct(product.id)}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No products found. Add one to get started!
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 50
                }} onClick={() => setShowModal(false)}>
                    <div className="card" style={{ width: '400px' }} onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl mb-6">Add New Product</h2>
                        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4">{error}</div>}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-sm">Product Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    autoFocus
                                    required
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-sm">Price (₹)</label>
                                    <input
                                        type="number" step="0.01"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        required
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm">GST (%)</label>
                                    <input
                                        type="number" step="0.1"
                                        value={formData.gst_rate}
                                        onChange={e => setFormData({ ...formData, gst_rate: e.target.value })}
                                        style={{ width: '100%' }}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm">Category</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    list="categories"
                                    style={{ width: '100%' }}
                                />
                                <datalist id="categories">
                                    <option value="Electronics" />
                                    <option value="Groceries" />
                                    <option value="Clothing" />
                                    <option value="Services" />
                                </datalist>
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={isLoading} className="btn btn-primary">
                                    {isLoading ? 'Saving...' : 'Save Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManager;
