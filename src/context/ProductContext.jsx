import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import localDb from '../utils/localDb';

const ProductContext = createContext();

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) throw new Error('useProducts must be used within a ProductProvider');
    return context;
};

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const fetchProducts = async () => {
        setLoading(true);
        // Always load local products as base or offline backup
        const localProducts = localDb.getCollection('products');
        setProducts(localProducts);

        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
                // Sync to local for offline use
                localDb.save('products', data);
            }
        } catch (error) {
            console.warn('Backend unreachable, using local products', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [user]);

    const addProduct = async (product) => {
        // Optimistic update locally
        const newLocalProduct = localDb.addToCollection('products', product);
        setProducts(prev => [...prev, newLocalProduct]);

        if (!user) return newLocalProduct;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(product)
            });
            if (res.ok) {
                const newProduct = await res.json();
                // Replace temp local product with server product
                setProducts(prev => prev.map(p => p.id === newLocalProduct.id ? newProduct : p));
                return newProduct;
            }
        } catch (err) {
            console.warn('Offline: Product saved locally only');
        }
        return newLocalProduct;
    };

    const deleteProduct = async (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        localDb.removeFromCollection('products', id);

        if (!user) return;

        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.warn('Offline: Deleted locally only');
        }
    };

    const updateProduct = async (id, updatedData) => {
        // Local update
        const updatedLocal = localDb.updateInCollection('products', id, updatedData);
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));

        if (!user) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });
            if (res.ok) {
                const updated = await res.json();
                setProducts(prev => prev.map(p => p.id === id ? updated : p));
            }
        } catch (err) {
            console.warn('Offline: Updated locally only');
        }
    };

    return (
        <ProductContext.Provider value={{ products, loading, addProduct, deleteProduct, updateProduct, refreshProducts: fetchProducts }}>
            {children}
        </ProductContext.Provider>
    );
};
