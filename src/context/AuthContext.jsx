import { createContext, useContext, useState, useEffect } from 'react';
import localDb from '../utils/localDb';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Init local DB on first visit
        localDb.init();

        // Check for existing token
        const token = localStorage.getItem('token');
        if (token) {
            fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error('Invalid token');
                })
                .then(data => {
                    setUser(data.user);
                    // Sync local profile from server
                    localDb.save('profile', data.user);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    // Fallback to local profile
                    setUser(localDb.get('profile'));
                })
                .finally(() => setLoading(false));
        } else {
            // Load local profile for guest mode
            setUser(localDb.get('profile'));
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data.user;
    };

    const signup = async (email, password, businessName) => {
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password, businessName })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateProfile = async (updates) => {
        // Update local first
        const currentProfile = localDb.get('profile') || {};
        const newProfile = { ...currentProfile, ...updates };
        localDb.save('profile', newProfile);
        setUser(newProfile);

        if (!localStorage.getItem('token')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                localDb.save('profile', data.user);
            }
        } catch (err) {
            console.warn('Offline: Profile updated locally only');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
