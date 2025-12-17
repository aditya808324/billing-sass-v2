import { Printer, CheckCircle } from 'lucide-react';

const Invoice = ({ data, onNewSale }) => {
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
                        <h1 className="text-3xl font-bold text-indigo-600 mb-1">NeoBill Shop</h1>
                        <p className="text-gray-500 text-sm">123 Market Street, Cityville, IN</p>
                        <p className="text-gray-500 text-sm">GSTIN: 29ABCDE1234F1Z5</p>
                    </div>
                    <div className="text-right">
                        <p className="font-mono text-gray-500 mb-1">Invoice #{data.id.slice(-8).toUpperCase()}</p>
                        <p className="text-sm font-medium">{formatDate(data.date)}</p>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-gray-100 text-left">
                            <th className="py-2 text-sm font-semibold text-gray-600 w-5/12">Item</th>
                            <th className="py-2 text-sm font-semibold text-gray-600 text-center w-1/12">Qty</th>
                            <th className="py-2 text-sm font-semibold text-gray-600 text-right w-2/12">Price</th>
                            <th className="py-2 text-sm font-semibold text-gray-600 text-right w-2/12">Disc.</th>
                            <th className="py-2 text-sm font-semibold text-gray-600 text-right w-2/12">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, index) => {
                            const itemTotal = (item.price - item.discount) * item.quantity;
                            return (
                                <tr key={index} className="border-b border-gray-50">
                                    <td className="py-3 text-sm">{item.name}</td>
                                    <td className="py-3 text-sm text-center">{item.quantity}</td>
                                    <td className="py-3 text-sm text-right">₹{item.price.toFixed(2)}</td>
                                    <td className="py-3 text-sm text-right text-red-500">
                                        {item.discount > 0 ? `-₹${item.discount}` : '-'}
                                    </td>
                                    <td className="py-3 text-sm text-right font-medium">₹{itemTotal.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-56 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal:</span>
                            <span>₹{Number(data.subtotal).toFixed(2)}</span>
                        </div>
                        {data.discountTotal > 0 && (
                            <div className="flex justify-between text-sm text-red-500">
                                <span>Extra Discount:</span>
                                <span>-₹{Number(data.discountTotal).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>GST (5%):</span>
                            <span>₹{Number(data.taxTotal || data.tax).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-indigo-900 border-t border-gray-200 pt-2 mt-2">
                            <span>Grand Total:</span>
                            <span>₹{Number(data.grandTotal || data.total).toFixed(2)}</span>
                        </div>
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
