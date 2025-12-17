import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const InvoiceContext = createContext();

export const useInvoices = () => {
    const context = useContext(InvoiceContext);
    if (!context) throw new Error('useInvoices must be used within an InvoiceProvider');
    return context;
};

export const InvoiceProvider = ({ children }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const fetchInvoices = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/invoices', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setInvoices(data);
            }
        } catch (error) {
            console.error('Failed to fetch invoices', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [user]);

    const addInvoice = async (invoiceData) => {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/invoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(invoiceData)
        });

        if (res.ok) {
            const newInvoice = await res.json();
            setInvoices(prev => [newInvoice, ...prev]);
            return newInvoice;
        } else {
            const err = await res.json();
            throw new Error(err.error || 'Failed to create invoice');
        }
    };

    const getStats = () => {
        const totalRevenue = invoices.reduce((acc, inv) => acc + Number(inv.grand_total), 0);
        const totalInvoices = invoices.length;

        const today = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
        const todaySales = invoices
            .filter(inv => {
                const invDate = new Date(inv.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
                return invDate === today;
            })
            .reduce((acc, inv) => acc + Number(inv.grand_total), 0);

        return { totalRevenue, totalInvoices, todaySales };
    };

    return (
        <InvoiceContext.Provider value={{ invoices, loading, addInvoice, getStats, refreshInvoices: fetchInvoices }}>
            {children}
        </InvoiceContext.Provider>
    );
};
