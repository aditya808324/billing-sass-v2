import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

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
        if (!user) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [user]);

    const addProduct = async (product) => {
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
            setProducts(prev => [...prev, newProduct]);
            return newProduct;
        }
        throw new Error('Failed to add product');
    };

    const deleteProduct = async (id) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            setProducts(prev => prev.filter(p => p.id !== id));
        }
    };

    const updateProduct = async (id, updatedData) => {
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
    };

    return (
        <ProductContext.Provider value={{ products, loading, addProduct, deleteProduct, updateProduct, refreshProducts: fetchProducts }}>
            {children}
        </ProductContext.Provider>
    );
};
