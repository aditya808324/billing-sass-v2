import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import localDb from '../utils/localDb';

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
        setLoading(true);
        // Load local invoices
        const localInvoices = localDb.getCollection('invoices');
        setInvoices(localInvoices);

        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/invoices', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setInvoices(data);
                // Sync to local
                localDb.save('invoices', data);
            }
        } catch (error) {
            console.warn('Backend unreachable, using local invoices', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [user]);

    const addInvoice = async (invoiceData) => {
        // Optimistic local save
        const newLocalInvoice = localDb.addToCollection('invoices', invoiceData);
        setInvoices(prev => [newLocalInvoice, ...prev]);

        if (!user) return newLocalInvoice;

        try {
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
                // Replace temp with server invoice
                setInvoices(prev => prev.map(inv => inv.id === newLocalInvoice.id ? newInvoice : inv));
                return newInvoice;
            }
        } catch (err) {
            console.warn('Offline: Invoice saved locally only');
        }
        return newLocalInvoice;
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
