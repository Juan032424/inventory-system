import propTypes from 'prop-types';

export default function AuditView({ quality, dailyBreakdown, totalRaw, totalFiltered }) {
    // Generate daily rows from breakdown objects
    // dailyBreakdown is [{name: '2023-01-01', Entrada: 10, ...}, ...]
    // We want to display this in a table.

    // Get all unique process keys excluding 'name'
    const processKeys = new Set();
    dailyBreakdown.forEach(day => {
        Object.keys(day).forEach(k => {
            if (k !== 'name' && k !== 'Total_Movimientos') processKeys.add(k);
        });
    });
    const columns = Array.from(processKeys).sort();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card bg-slate-800 text-white border-none">
                    <p className="opacity-70 text-sm">Total Filas (Original)</p>
                    <div className="text-3xl font-bold">{totalRaw.toLocaleString()}</div>
                </div>
                <div className="card">
                    <p className="text-slate-500 text-sm">Filas (Filtrado)</p>
                    <div className="text-3xl font-bold text-primary">{totalFiltered.toLocaleString()}</div>
                </div>
                <div className="card">
                    <p className="text-slate-500 text-sm">Fechas Únicas</p>
                    <div className="text-3xl font-bold text-slate-700">{quality.unique_dates}</div>
                </div>
                <div className={`card ${quality.null_cantidad > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <p className={`${quality.null_cantidad > 0 ? 'text-red-600' : 'text-green-600'} text-sm font-medium`}>Filas Invalidas (Qty)</p>
                    <div className={`text-3xl font-bold ${quality.null_cantidad > 0 ? 'text-red-700' : 'text-green-700'}`}>
                        {quality.null_cantidad}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Process Distribution */}
                <div className="card">
                    <h3 className="font-bold text-lg mb-4">📊 Conteos por Proceso (Raw)</h3>
                    <div className="space-y-3">
                        {Object.entries(quality.process_counts).map(([proc, count]) => (
                            <div key={proc} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="font-medium text-slate-700">{proc}</span>
                                <span className="font-mono font-bold text-slate-900">{count.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="card bg-blue-50 border-blue-100 flex items-center justify-center text-center p-8">
                    <div>
                        <h4 className="text-blue-900 font-bold text-lg mb-2">Información de Auditoría</h4>
                        <p className="text-blue-700 text-sm max-w-md mx-auto">
                            Esta sección permite validar la integridad de los datos. Si "Total Filas (Original)" difiere de "Filas (Filtrado)", tienes filtros activos que excluyen registros.
                        </p>
                    </div>
                </div>
            </div>

            {/* Daily Breakdown Table */}
            <div className="card overflow-hidden">
                <h3 className="font-bold text-lg mb-4">📅 Desglose Diario</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
                            <tr>
                                <th className="py-3 px-4 rounded-l-lg">Fecha</th>
                                {columns.map(col => (
                                    <th key={col} className="py-3 px-4 text-right">{col}</th>
                                ))}
                                <th className="py-3 px-4 text-right font-bold rounded-r-lg">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {dailyBreakdown.map((row, idx) => {
                                const total = columns.reduce((acc, col) => acc + (row[col] || 0), 0);
                                return (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="py-3 px-4 font-mono text-slate-600">{row.name}</td>
                                        {columns.map(col => (
                                            <td key={col} className={`py-3 px-4 text-right ${row[col] ? 'text-slate-800' : 'text-slate-300'}`}>
                                                {row[col] ? row[col].toLocaleString() : '-'}
                                            </td>
                                        ))}
                                        <td className="py-3 px-4 text-right font-bold bg-slate-50">{total.toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

AuditView.propTypes = {
    quality: propTypes.object,
    dailyBreakdown: propTypes.array,
    totalRaw: propTypes.number,
    totalFiltered: propTypes.number
};
