import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="glass-panel p-8 rounded-xl w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                    Welcome Back
                </h2>
                {error && <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-indigo-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-indigo-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded font-bold hover:opacity-90 disabled:opacity-50"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-400">
                    Don't have an account? <Link to="/signup" className="text-indigo-400 hover:text-indigo-300">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
