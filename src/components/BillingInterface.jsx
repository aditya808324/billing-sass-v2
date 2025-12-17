import { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useInvoices } from '../context/InvoiceContext';
import { Search, Plus, Minus, Trash, Printer, ShoppingCart, IndianRupee } from 'lucide-react';
import Invoice from './Invoice';

const BillingInterface = () => {
    const { products } = useProducts();
    const { addInvoice } = useInvoices();
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [globalDiscount, setGlobalDiscount] = useState(0);
    const [cashReceived, setCashReceived] = useState(0);
    const [showInvoice, setShowInvoice] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Search: /
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                document.getElementById('searchInput')?.focus();
            }
            // Checkout: Ctrl + Enter
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                handleCheckout();
            }
            // Cash Input: Ctrl + Space
            if (e.ctrlKey && e.key === ' ') {
                e.preventDefault();
                document.getElementById('cashInput')?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, globalDiscount, customerName, customerPhone]); // Dependencies specific to checkout

    const addToCart = (product) => {
        // ... unchanged ...
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                productId: product.id,
                name: product.name,
                price: parseFloat(product.price),
                quantity: 1,
                discount: 0
            }];
        });
    };

    // ... existing functions ...

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        // Save Invoice Payload matching API schema
        const invoicePayload = {
            items: cart,
            subtotal,
            discountTotal: globalDiscount,
            taxTotal: tax,
            grandTotal: total,
            customerDetails: {
                name: customerName || 'Walk-in Customer',
                phone: customerPhone || ''
            },
            paymentMethod: 'CASH',
            notes: ''
        };

        try {
            await addInvoice(invoicePayload);
            // We should ideally get the real invoice from backend, but for UI updates we use local data temporarily
            // Or better, let addInvoice return the real one.
            const localDisplayInvoice = {
                ...invoicePayload,
                id: 'GENERATING...',
                date: new Date().toISOString()
            };

            setCurrentInvoice(localDisplayInvoice);
            setShowInvoice(true);
        } catch (err) {
            console.error(err);
            alert(`Failed to save invoice! Error: ${err.message}`);
        }
    };

    const startNewSale = () => {
        setCart([]);
        setGlobalDiscount(0);
        setShowInvoice(false);
        setCurrentInvoice(null);
    };

    if (showInvoice && currentInvoice) {
        return (
            <div className="animate-fade-in">
                <button
                    onClick={() => setShowInvoice(false)}
                    className="mb-4 text-sm text-gray-400 hover:text-white"
                >
                    &larr; Back to Billing
                </button>
                <Invoice data={currentInvoice} onNewSale={startNewSale} />
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
            {/* Product Selection (Left) */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '2.5rem', width: '100%' }}
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-2" style={{ alignContent: 'start' }}>
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            className="card cursor-pointer hover:border-primary transition-colors p-4 flex flex-col justify-between min-h-[120px]"
                            onClick={() => addToCart(product)}
                        >
                            <div>
                                <h4 className="font-semibold truncate" title={product.name}>{product.name}</h4>
                                <p className="text-sm text-gray-400">{product.category}</p>
                            </div>
                            <div className="flex justify-between items-end mt-2">
                                <span className="text-lg font-bold text-success">₹{Number(product.price).toFixed(2)}</span>
                                <span className="bg-surface p-1 rounded-full"><Plus size={16} /></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart Summary (Right) */}
            <div className="w-full lg:w-[420px] flex flex-col card p-0 overflow-hidden border-0 shadow-2xl h-full">
                <div className="p-4 border-b border-subtle bg-surface/50">
                    <h2 className="text-xl flex items-center gap-2">
                        <ShoppingCart size={20} /> Current Bill
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {/* Customer Details Inputs */}
                    <div className="bg-surface p-3 rounded-lg border border-subtle space-y-2 mb-2">
                        <input
                            type="text"
                            placeholder="Customer Name"
                            className="w-full bg-app border border-subtle rounded p-2 text-sm focus:border-primary focus:outline-none"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                        <input
                            type="tel"
                            placeholder="Customer Phone"
                            className="w-full bg-app border border-subtle rounded p-2 text-sm focus:border-primary focus:outline-none"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                    </div>

                    {cart.length === 0 ? (
                        <div className="text-center text-gray-500 mt-2">Cart is empty</div>
                    ) : (
                        cart.map(item => (
                            <div key={item.productId} className="flex flex-col gap-2 bg-surface p-3 rounded-lg border border-subtle">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium truncate" title={item.name}>{item.name}</h4>
                                        <div className="text-xs text-gray-400">₹{Number(item.price || 0).toFixed(2)} each</div>
                                    </div>
                                    <button className="text-danger p-1" onClick={() => removeFromCart(item.productId)}>
                                        <Trash size={16} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between gap-2 mt-1">
                                    {/* Quantity Control */}
                                    <div className="flex items-center gap-1 bg-app rounded-md p-1 border border-subtle">
                                        <button className="px-2 hover:bg-white/10 rounded" onClick={() => updateItem(item.productId, 'quantity', item.quantity - 1)}>-</button>
                                        <span className="text-sm font-mono w-8 text-center">{item.quantity}</span>
                                        <button className="px-2 hover:bg-white/10 rounded" onClick={() => updateItem(item.productId, 'quantity', item.quantity + 1)}>+</button>
                                    </div>

                                    {/* Discount Control */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">Disc:</span>
                                        <input
                                            type="number"
                                            className="w-16 p-1 text-xs text-right bg-app border-subtle"
                                            placeholder="0"
                                            value={item.discount || ''}
                                            onChange={(e) => updateItem(item.productId, 'discount', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 bg-surface/50 border-t border-subtle space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>₹{Number(subtotal || 0).toFixed(2)}</span>
                    </div>

                    {/* Global Discount Input */}
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-indigo-400">Extra Discount</span>
                        <div className="flex items-center gap-1">
                            <span className="text-gray-400">- ₹</span>
                            <input
                                type="number"
                                className="w-20 p-1 text-right bg-app border-subtle rounded"
                                value={globalDiscount || ''}
                                placeholder="0"
                                onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between text-sm text-gray-400">
                        <span>Tax (5% GST)</span>
                        <span>₹{Number(tax || 0).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-xl font-bold pt-3 border-t border-dashed border-gray-600">
                        <span>Total</span>
                        <span className="text-success">₹{Number(total || 0).toFixed(2)}</span>
                    </div>

                    <button
                        className="btn btn-primary w-full justify-center py-3 text-lg mt-3"
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                    >
                        <Printer size={20} /> Generate Invoice
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillingInterface;
