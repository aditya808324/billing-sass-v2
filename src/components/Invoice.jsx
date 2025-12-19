import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Printer, CheckCircle } from 'lucide-react';

const Invoice = ({ data, onNewSale }) => {
    const { user } = useAuth();

    // ... existing handlePrint and formatDate ...

    useEffect(() => {
        if (data && data.id !== 'GENERATING...') {
            const timer = setTimeout(() => {
                window.print();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [data]);

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="flex flex-col items-center animate-fade-in pb-10">
            {/* Actions Bar - Hidden when printing */}
            <div className="print-hidden flex justify-end w-full max-w-2xl mb-6 gap-4">
                <button className="btn btn-secondary" onClick={handlePrint}>
                    <Printer size={18} /> Print Invoice
                </button>
                <button className="btn btn-primary" onClick={onNewSale}>
                    <CheckCircle size={18} /> New Sale
                </button>
            </div>

            {/* Invoice Paper */}
            <div className="invoice-paper bg-white text-slate-800 p-8 rounded-lg shadow-xl w-full max-w-2xl" id="invoice">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            {user?.logo_url && (
                                <img src={user.logo_url} alt="Logo" className="w-16 h-16 object-contain" />
                            )}
                            <h1 className="text-3xl font-bold text-indigo-600">{user?.business_name || 'My Shop'}</h1>
                        </div>
                        <p className="text-gray-500 text-sm whitespace-pre-wrap">{user?.address || 'Address Not Set'}</p>
                        {user?.gst_number && (
                            <p className="text-gray-500 text-sm font-medium mt-1">GSTIN: {user.gst_number}</p>
                        )}
                        <p className="text-gray-500 text-sm">Phone: {user?.phone || ''}</p>
                        <p className="text-gray-500 text-sm">Email: {user?.email || ''}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-mono text-gray-500 mb-1">Invoice #{data.id.slice(-8).toUpperCase()}</p>
                        <p className="text-sm font-medium">{formatDate(data.date)}</p>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-8 border-collapse">
                    <thead>
                        <tr className="border-b-2 border-gray-100 text-left">
                            <th className="py-2 text-xs font-semibold text-gray-600 w-4/12">Item Description</th>
                            <th className="py-2 text-xs font-semibold text-gray-600 text-center w-2/12">HSN</th>
                            <th className="py-2 text-xs font-semibold text-gray-600 text-center w-1/12">Qty</th>
                            <th className="py-2 text-xs font-semibold text-gray-600 text-right w-2/12">Rate</th>
                            <th className="py-2 text-xs font-semibold text-gray-600 text-right w-1/12">GST %</th>
                            <th className="py-2 text-xs font-semibold text-gray-600 text-right w-2/12">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, index) => {
                            const taxableValue = (item.price - item.discount) * item.quantity;
                            return (
                                <tr key={index} className="border-b border-gray-50">
                                    <td className="py-3 text-sm font-medium">{item.name}</td>
                                    <td className="py-3 text-sm text-center text-gray-500">{item.hsn_code || '-'}</td>
                                    <td className="py-3 text-sm text-center">{item.quantity}</td>
                                    <td className="py-3 text-sm text-right">₹{item.price.toFixed(2)}</td>
                                    <td className="py-3 text-sm text-right text-gray-500">{item.gst_rate}%</td>
                                    <td className="py-3 text-sm text-right font-medium">₹{taxableValue.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Tax Breakdown removed as per inclusive GST requirement */}

                {/* Totals */}
                <div className="flex justify-end border-t-2 border-indigo-600 pt-4">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Taxable Value:</span>
                            <span>₹{Number(data.subtotal).toFixed(2)}</span>
                        </div>
                        {data.discountTotal > 0 && (
                            <div className="flex justify-between text-sm text-red-500">
                                <span>Total Discount:</span>
                                <span>-₹{Number(data.discountTotal).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Tax (GST):</span>
                            <span className="italic text-xs">Inclusive in Price</span>
                        </div>
                        <div className="flex justify-between text-2xl font-black text-indigo-900 pt-2 border-t border-dashed border-gray-300">
                            <span>Total Amount:</span>
                            <span>₹{Number(data.grandTotal).toFixed(2)}</span>
                        </div>
                        <p className="text-[10px] text-right text-gray-400 italic">** GST is inclusive in the product price</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-gray-600 font-medium">Thank you for your visit!</p>
                    <p className="text-xs text-gray-400 mt-1">Returns accepted within 7 days with original receipt.</p>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
            @media print {
                body {
                    background: white;
                }
                .print-hidden, aside, nav, header {
                    display: none !important;
                }
                .app-container main {
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .invoice-paper {
                    box-shadow: none !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    position: static !important;
                    overflow: visible !important;
                }
            }
        `}</style>
        </div>
    );
};

export default Invoice;
