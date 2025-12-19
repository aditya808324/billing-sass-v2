// localDb.js - Standalone storage utility for the local-first billing app
const DB_PREFIX = 'billing_app_v1_';

const localDb = {
    // Generic CRUD
    save: (key, data) => {
        try {
            localStorage.setItem(DB_PREFIX + key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Storage error', e);
            return false;
        }
    },

    get: (key) => {
        const data = localStorage.getItem(DB_PREFIX + key);
        return data ? JSON.parse(data) : null;
    },

    // Collections
    getCollection: (name) => {
        return localDb.get(name) || [];
    },

    addToCollection: (name, item) => {
        const collection = localDb.getCollection(name);
        const newItem = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString() };
        collection.push(newItem);
        localDb.save(name, collection);
        return newItem;
    },

    updateInCollection: (name, id, updatedData) => {
        const collection = localDb.getCollection(name);
        const index = collection.findIndex(i => i.id === id);
        if (index !== -1) {
            collection[index] = { ...collection[index], ...updatedData, updated_at: new Date().toISOString() };
            localDb.save(name, collection);
            return collection[index];
        }
        return null;
    },

    removeFromCollection: (name, id) => {
        const collection = localDb.getCollection(name);
        const filtered = collection.filter(i => i.id !== id);
        localDb.save(name, filtered);
        return true;
    },

    // Initialize with mock data if empty (for demo/onboarding)
    init: () => {
        if (!localDb.get('products')) {
            localDb.save('products', [
                { id: '1', name: 'Sample Product', category: 'General', price: 100, gst_rate: 18, stock: 50, hsn_code: '1234' }
            ]);
        }
        if (!localDb.get('invoices')) {
            localDb.save('invoices', []);
        }
        if (!localDb.get('profile')) {
            localDb.save('profile', {
                business_name: 'My Local Shop',
                address: 'Set your address in Profile',
                phone: '',
                email: '',
                gst_number: ''
            });
        }
    }
};

export default localDb;
