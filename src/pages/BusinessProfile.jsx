import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save } from 'lucide-react';

const BusinessProfile = () => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        business_name: '',
        business_address: '',
        business_phone: '',
        business_email: '',
        gst_number: '',
        invoice_prefix: 'INV-',
        logo_url: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                business_name: user.business_name || '',
                business_address: user.business_address || '',
                business_phone: user.business_phone || '',
                business_email: user.business_email || '',
                gst_number: user.gst_number || '',
                invoice_prefix: user.invoice_prefix || 'INV-',
                logo_url: user.logo_url || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await updateProfile(formData);
            setMessage('Settings saved successfully!');
        } catch (error) {
            setMessage('Error saving settings.');
        }
    };

    return (
        <div className="glass-panel p-6 rounded-xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-indigo-400">Business Settings</h2>
            {message && <div className={`p-3 rounded mb-4 ${message.includes('Error') ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Business Name</label>
                        <input name="business_name" value={formData.business_name} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-indigo-500 outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">GST Number</label>
                        <input name="gst_number" value={formData.gst_number} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-indigo-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Contact Phone</label>
                        <input name="business_phone" value={formData.business_phone} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-indigo-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Contact Email</label>
                        <input name="business_email" value={formData.business_email} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-indigo-500 outline-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-1">Business Address</label>
                    <textarea name="business_address" value={formData.business_address} onChange={handleChange} rows="3" className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-indigo-500 outline-none"></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Invoice Prefix (e.g. INV-, BILL-)</label>
                        <input name="invoice_prefix" value={formData.invoice_prefix} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-indigo-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Logo URL (Optional)</label>
                        <input name="logo_url" value={formData.logo_url} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-indigo-500 outline-none" />
                    </div>
                </div>

                <button type="submit" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    <Save size={18} />
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default BusinessProfile;
