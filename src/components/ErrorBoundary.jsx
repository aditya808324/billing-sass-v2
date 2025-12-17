import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8">
                    <div className="max-w-2xl w-full bg-gray-800 rounded-lg shadow-xl p-8 border border-red-500">
                        <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong.</h1>
                        <p className="text-gray-300 mb-6">The application crashed. Here is the error details:</p>

                        <div className="bg-black/50 p-4 rounded overflow-auto mb-6 font-mono text-sm text-red-300">
                            {this.state.error && this.state.error.toString()}
                        </div>

                        <details className="whitespace-pre-wrap font-mono text-xs text-gray-500">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </details>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-medium"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
