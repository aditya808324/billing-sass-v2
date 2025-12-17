import { createContext, useContext, useState, useEffect } from 'react';

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
                .then(data => setUser(data.user))
                .catch(() => {
                    localStorage.removeItem('token');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
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
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(updates)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setUser(data.user);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
