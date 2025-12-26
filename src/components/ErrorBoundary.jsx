import React from 'react';
import propTypes from 'prop-types';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200 mt-10">
                    <h2 className="text-xl font-bold mb-2">Algo salió mal al mostrar los datos</h2>
                    <p className="font-mono text-sm bg-white p-2 rounded inline-block">
                        {this.state.error?.toString()}
                    </p>
                    <p className="mt-4 text-sm text-slate-600">
                        Intenta recargar la página o verifica que tu archivo Excel tenga el formato correcto.
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: propTypes.node
};

export default ErrorBoundary;
