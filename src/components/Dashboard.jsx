import { useInvoices } from '../context/InvoiceContext';
import { TrendingUp, Calendar, FileText, IndianRupee } from 'lucide-react';

const Dashboard = () => {
    const { invoices, getStats } = useInvoices();
    const { totalRevenue, totalInvoices, todaySales } = getStats();

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="card p-6 flex items-start justify-between relative overflow-hidden group">
            <div className="z-10 relative">
                <p className="text-sm text-gray-400 mb-1">{title}</p>
                <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400" style={{ backgroundImage: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                    {value}
                </h3>
            </div>
            <div className={`p-3 rounded-xl bg-opacity-10 ${color} bg-white`}>
                <Icon size={24} className="text-white" />
            </div>

            {/* Glow Effect */}
            <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-3xl opacity-10 ${color} bg-white transition-opacity group-hover:opacity-20 pointer-events-none`}></div>
        </div>
    );

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₹${(totalRevenue || 0).toFixed(2)}`}
                    icon={IndianRupee}
                    color="bg-green-500"
                />
                <StatCard
                    title="Today's Sales"
                    value={`₹${(todaySales || 0).toFixed(2)}`}
                    icon={TrendingUp}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Total Invoices"
                    value={totalInvoices}
                    icon={FileText}
                    color="bg-purple-500"
                />
            </div>

            {/* Recent Activity */}
            <div className="card flex flex-col gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Calendar size={20} className="text-primary" /> Recent Transactions
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-subtle text-sm text-gray-400">
                                <th className="p-3">Invoice ID</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Customer</th>
                                <th className="p-3 text-right">Amount</th>
                                <th className="p-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        No transactions yet. Start billing to see data here.
                                    </td>
                                </tr>
                            ) : (
                                invoices.slice(0, 5).map(inv => (
                                    <tr key={inv.id} className="border-b border-subtle hover:bg-surface transition-colors">
                                        <td className="p-3 font-mono text-sm">{inv.id.slice(-6)}</td>
                                        <td className="p-3 text-sm">
                                            {new Date(inv.date).toLocaleString('en-IN', {
                                                timeZone: 'Asia/Kolkata',
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="p-3 text-sm">{inv.customerName || 'Walk-in'}</td>
                                        <td className="p-3 text-right font-bold text-success">
                                            ₹{Number(inv.total || 0).toFixed(2)}
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">
                                                Paid
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
