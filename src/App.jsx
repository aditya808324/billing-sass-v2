import { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, History, LogOut, Settings } from 'lucide-react';
import './index.css';

import { ProductProvider } from './context/ProductContext';
import { InvoiceProvider } from './context/InvoiceContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import ProductManager from './components/ProductManager';
import BillingInterface from './components/BillingInterface';
import Dashboard from './components/Dashboard';
import BillHistory from './components/BillHistory';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BusinessProfile from './pages/BusinessProfile';
import ProtectedRoute from './components/ProtectedRoute';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { id: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { id: '/billing', icon: ShoppingCart, label: 'Billing' },
    { id: '/products', icon: Package, label: 'Products' },
    { id: '/history', icon: History, label: 'History' },
    { id: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="glass-panel" style={{
      width: '260px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem',
      zIndex: 50
    }}>
      <div className="logo" style={{ marginBottom: '3rem' }}>
        <h2 className="text-2xl font-bold" style={{
          background: 'linear-gradient(to right, #6366f1, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          NeoBill
        </h2>
        <p className="text-sm text-gray-400">Premium Shop Billing</p>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: location.pathname === item.id ? 'var(--primary)' : 'transparent',
              color: location.pathname === item.id ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              fontSize: '1rem',
              width: '100%',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors mt-auto"
      >
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  );
};

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="app-container min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <main style={{ marginLeft: '260px', padding: '2rem', minHeight: '100vh' }}>
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold capitalize">
            {window.location.pathname === '/' ? 'Dashboard' : window.location.pathname.replace('/', '')}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Welcome, {user?.business_name || user?.email}</span>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center font-bold">
              {(user?.business_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <InvoiceProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/billing" element={
              <ProtectedRoute>
                <Layout><BillingInterface /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/products" element={
              <ProtectedRoute>
                <Layout><ProductManager /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/history" element={
              <ProtectedRoute>
                <Layout><BillHistory /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout><BusinessProfile /></Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </InvoiceProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;

