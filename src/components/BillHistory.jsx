import { useState, useEffect } from 'react';
import { Search, Printer, Calendar, FileText, Loader } from 'lucide-react';
import Invoice from './Invoice';

const BillHistory = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBill, setSelectedBill] = useState(null);

    const fetchBills = async (search = '') => {
        setLoading(true);
        try {
            const query = search ? `?search=${encodeURIComponent(search)}` : '';
            const res = await fetch(`/api/bills${query}`);
            if (res.ok) {
                const data = await res.json();
                setBills(data);
            }
        } catch (error) {
            console.error('Failed to fetch bills:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchBills(searchTerm);
    };

    if (selectedBill) {
        return (
            <div className="animate-fade-in">
                <button
                    onClick={() => setSelectedBill(null)}
                    className="mb-4 text-sm text-gray-400 hover:text-white"
                >
                    &larr; Back to History
                </button>
                <Invoice data={selectedBill} onNewSale={() => setSelectedBill(null)} />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                    Bill History
                </h2>

                <form onSubmit={handleSearch} className="relative w-72">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or bill no..."
                        className="w-full pl-10 pr-4 py-2 bg-surface border border-subtle rounded-lg focus:outline-none focus:border-primary transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
            </div>

            <div className="bg-surface rounded-xl border border-subtle flex-1 overflow-hidden flex flex-col shadow-2xl">
                <div className="grid grid-cols-5 p-4 border-b border-subtle text-gray-400 text-sm font-medium">
                    <div className="col-span-1">Bill Number</div>
                    <div className="col-span-1">Date</div>
                    <div className="col-span-1">Customer</div>
                    <div className="col-span-1 text-right">Amount</div>
                    <div className="col-span-1 text-center">Action</div>
                </div>

                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {loading ? (
                        <div className="flex justify-center items-center h-40 text-primary">
                            <Loader className="animate-spin" size={32} />
                        </div>
                    ) : bills.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10">No bills found</div>
                    ) : (
                        bills.map(bill => (
                            <div key={bill.id} className="grid grid-cols-5 p-4 bg-app rounded-lg hover:bg-white/5 transition-colors items-center border border-transparent hover:border-subtle group">
                                <div className="col-span-1 font-mono text-sm text-indigo-300">{bill.id}</div>
                                <div className="col-span-1 text-sm text-gray-400 flex items-center gap-2">
                                    <Calendar size={14} />
                                    {new Date(bill.created_at).toLocaleDateString()}
                                </div>
                                <div className="col-span-1 text-sm">{bill.customer_name}</div>
                                <div className="col-span-1 text-right font-bold text-success">
                                    ₹{Number(bill.total || 0).toFixed(2)}
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    <button
                                        onClick={() => setSelectedBill({
                                            ...bill,
                                            date: bill.created_at,
                                            items: bill.items // Assuming JSON is parsed automatically by client or we need accessors
                                        })}
                                        className="p-2 text-primary hover:bg-primary/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        title="View/Print"
                                    >
                                        <FileText size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default BillHistory;
