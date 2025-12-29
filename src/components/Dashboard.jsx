import { ArrowUpRight, ArrowDownRight, Package, Truck, Archive, CheckCircle, TrendingUp, Users, Calendar, Undo2, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area, PieChart, Pie, Cell, ComposedChart } from 'recharts';
import propTypes from 'prop-types';
import { utils, writeFile } from 'xlsx';

const KPICard = ({ title, value, icon: Icon, gradient }) => (
    <div
        className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-xl ${gradient} shadow-blue-900/20 ring-1 ring-black/5 transform hover:-translate-y-1 transition-all duration-300`}
    >
        <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-blue-100/90 text-sm font-medium mb-1 tracking-wide">{title}</p>
                <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Icon size={24} className="text-white" />
            </div>
        </div>
        {/* Decorative Circles */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800/95 backdrop-blur-sm p-4 border border-slate-700 shadow-xl rounded-xl text-xs text-white">
                <p className="font-bold mb-2 text-slate-300 border-b border-slate-600 pb-1">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                        <span className="text-slate-200">{entry.name}:</span>
                        <span className="font-mono font-bold">{entry.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function Dashboard({ kpis, summary, gestorDist, dailyStats, processDist, pareto }) {
    const topStock = [...summary].sort((a, b) => b.Stock_Almacen - a.Stock_Almacen).slice(0, 10);
    const topGestor = [...gestorDist].slice(0, 10);

    const handleExportExcel = () => {
        try {
            // Format data for Excel
            const dataToExport = summary.map(item => ({
                "Código Material": item.Codigo,
                "Descripción Material": item.Material,
                "Total Ingresado": item.Ingresado,
                "Total Entregado": item.Entregado,
                "Total Devoluciones": item.Devoluciones,
                "Stock en Almacén": item.Stock_Almacen,
                "Stock en Calle (Gestores)": item.Stock_Calle
            }));

            // Create workbook and worksheet
            const ws = utils.json_to_sheet(dataToExport);
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, "Inventario Stock");

            // Auto-width columns (basic estimation)
            const wscols = [
                { wch: 15 }, // Codigo
                { wch: 40 }, // Material
                { wch: 15 }, // Ingresado
                { wch: 15 }, // Entregado
                { wch: 15 }, // Devoluciones
                { wch: 15 }, // Stock Almacen
                { wch: 20 }, // Stock Calle
            ];
            ws['!cols'] = wscols;

            // Generate filename with date
            const dateStr = new Date().toISOString().split('T')[0];
            writeFile(wb, `Reporte_Inventario_${dateStr}.xlsx`);
        } catch (error) {
            console.error("Error exporting Excel:", error);
            alert("Hubo un error al generar el Excel.");
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <KPICard
                    title="Material Recibido"
                    value={kpis.Material_Recibido.toLocaleString()}
                    icon={ArrowDownRight}
                    gradient="bg-gradient-to-br from-zinc-200 to-blue-600"
                />
                <KPICard
                    title="Material Distribuido"
                    value={kpis.Material_Distribuido.toLocaleString()}
                    icon={ArrowUpRight}
                    gradient="bg-gradient-to-br from-zinc-200 to-blue-600"
                />
                <KPICard
                    title="Total Devoluciones"
                    value={kpis.Devoluciones.toLocaleString()}
                    icon={Undo2}
                    gradient="bg-gradient-to-br from-slate-200 to-blue-600"
                />
                <KPICard
                    title="Stock Almacén"
                    value={kpis.Stock_Almacen.toLocaleString()}
                    icon={Archive}
                    gradient="bg-gradient-to-br from-zinc-200 to-blue-600"
                />
                <KPICard
                    title="Stock Calle"
                    value={kpis.Stock_Calle.toLocaleString()}
                    icon={Package}
                    gradient="bg-gradient-to-br from-zinc-200 to-blue-600"
                />
                <KPICard
                    title="Total Movimientos"
                    value={kpis.Total_Movimientos.toLocaleString()}
                    icon={CheckCircle}
                    gradient="bg-gradient-to-br from-slate-200 to-blue-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Table Section */}
                <div className={`lg:col-span-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col h-[520px] overflow-hidden ${(!topStock.some(i => i.Stock_Almacen > 0)) ? 'lg:col-span-3' : ''}`}>
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-blue-50/50 to-white">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-white shadow-sm text-blue-600 rounded-lg ring-1 ring-blue-100">
                                <TrendingUp size={20} />
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">Resumen de Materiales</h3>
                        </div>
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm ring-1 ring-emerald-500"
                            title="Descargar tabla en Excel"
                        >
                            <Download size={14} />
                            Descargar Excel
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10">
                                <tr>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase tracking-wider">Material / Item</th>
                                    <th className="py-4 px-4 text-right font-semibold text-xs uppercase tracking-wider">Entrada</th>
                                    <th className="py-4 px-4 text-right font-semibold text-xs uppercase tracking-wider">Salida</th>
                                    <th className="py-4 px-4 text-right font-semibold text-xs uppercase tracking-wider">Stock Alm.</th>
                                    <th className="py-4 px-6 text-right font-semibold text-xs uppercase tracking-wider">Stock Calle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {summary.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="py-3 px-6 font-medium text-slate-700 max-w-xs truncate group-hover:text-blue-700 transition-colors" title={row.Material}>
                                            {row.Material}
                                        </td>
                                        <td className="py-3 px-4 text-right text-slate-500">{row.Ingresado.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-right text-slate-500">{row.Entregado.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-right">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${row.Stock_Almacen > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {row.Stock_Almacen.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-right">
                                            <span className="text-orange-600 font-semibold">{row.Stock_Calle.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Stock Chart - Only show if there is stock */}
                {topStock.some(i => i.Stock_Almacen > 0) && (
                    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col h-[520px]">
                        <div className="p-6 border-b border-slate-50 flex items-center gap-2 bg-gradient-to-r from-blue-50/50 to-white">
                            <div className="p-2 bg-white shadow-sm text-blue-600 rounded-lg ring-1 ring-blue-100">
                                <Archive size={20} />
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">Top 10 Stock (Almacén)</h3>
                        </div>
                        <div className="flex-1 p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topStock} layout="vertical" margin={{ left: 0, right: 30, top: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="Material"
                                        type="category"
                                        width={100}
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        interval={0}
                                        tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val}
                                    />
                                    <ReTooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                                    <Bar dataKey="Stock_Almacen" name="Stock" radius={[0, 6, 6, 0]} barSize={24}>
                                        {topStock.map((entry, index) => (
                                            <text x={10} y={10} fill="white" key={index}></text> // Placeholder
                                        ))}
                                    </Bar>
                                    <Bar dataKey="Stock_Almacen" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            <div className={`grid grid-cols-1 ${kpis.Material_Distribuido > 0 ? 'lg:grid-cols-2' : ''} gap-8`}>
                {/* Gestor Distribution - Only show if there are deliveries */}
                {kpis.Material_Distribuido > 0 && (
                    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 h-[450px] flex flex-col">
                        <div className="p-6 border-b border-slate-50 flex items-center gap-2 bg-gradient-to-r from-sky-50/50 to-white">
                            <div className="p-2 bg-white shadow-sm text-sky-600 rounded-lg ring-1 ring-sky-100">
                                <Users size={20} />
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">Top Entregas por Gestor</h3>
                        </div>
                        <div className="flex-1 p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topGestor} layout="vertical" margin={{ left: 10, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="Gestor" type="category" width={130} tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <ReTooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                                    <Bar dataKey="Entregado" name="Entregado" fill="#0ea5e9" radius={[0, 6, 6, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Time Series */}
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 h-[450px] flex flex-col">
                    <div className="p-6 border-b border-slate-50 flex items-center gap-2 bg-gradient-to-r from-blue-50/50 to-white">
                        <div className="p-2 bg-white shadow-sm text-blue-600 rounded-lg ring-1 ring-blue-100">
                            <Calendar size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800">Evolución de Movimientos</h3>
                    </div>
                    <div className="flex-1 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSalida" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <ReTooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
                                <Area type="monotone" dataKey="Entrada" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEntrada)" />
                                <Area type="monotone" dataKey="Salida" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorSalida)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* NEW ANALYTICS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">

                {/* 1. Global Detail (Donut) */}
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 h-[450px] flex flex-col">
                    <div className="p-6 border-b border-slate-50 flex items-center gap-2 bg-gradient-to-r from-blue-50/50 to-white">
                        <div className="p-2 bg-white shadow-sm text-blue-600 rounded-lg ring-1 ring-blue-100">
                            <Users size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800">Distribución de Material</h3>
                    </div>
                    <div className="flex-1 p-4 flex flex-col items-center justify-center relative">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={processDist}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {processDist?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <ReTooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Legend */}
                        <div className="flex flex-wrap justify-center gap-4 mt-2">
                            {processDist?.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    {item.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. Pareto Chart (Composed) */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 h-[450px] flex flex-col">
                    <div className="p-6 border-b border-slate-50 flex items-center gap-2 bg-gradient-to-r from-slate-50/50 to-white">
                        <div className="p-2 bg-white shadow-sm text-slate-600 rounded-lg ring-1 ring-slate-200">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800">Pareto de Movimientos (80/20)</h3>
                    </div>
                    <div className="flex-1 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={pareto} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    scale="band"
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    tickFormatter={(val) => val.length > 12 ? val.substr(0, 12) + '...' : val}
                                />
                                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <ReTooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Bar yAxisId="left" dataKey="value" name="Volumen Total" fill="#2563eb" barSize={30} radius={[4, 4, 0, 0]} />
                                <Line yAxisId="right" type="monotone" dataKey="cumPercentage" name="% Acumulado" stroke="#0f172a" strokeWidth={2} dot={{ r: 4, fill: '#0f172a' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* NEW: DETAILED STOCK REPORT SECTION */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col mt-8">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-emerald-50/50 to-white">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-white shadow-sm text-emerald-600 rounded-lg ring-1 ring-emerald-100">
                            <Package size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800">Detalle de Stock en Almacén ({summary.filter(i => i.Stock_Almacen > 0).length})</h3>
                    </div>
                    <button
                        onClick={() => {
                            try {
                                const stockOnly = summary.filter(i => i.Stock_Almacen > 0);
                                const dataToExport = stockOnly.map(item => ({
                                    "Código": item.Codigo,
                                    "Material": item.Material,
                                    "Stock Actual": item.Stock_Almacen
                                }));
                                const ws = utils.json_to_sheet(dataToExport);
                                const wb = utils.book_new();
                                utils.book_append_sheet(wb, ws, "Stock Almacen");
                                const wscols = [{ wch: 15 }, { wch: 50 }, { wch: 15 }];
                                ws['!cols'] = wscols;
                                const dateStr = new Date().toISOString().split('T')[0];
                                writeFile(wb, `Stock_Almacen_${dateStr}.xlsx`);
                            } catch (error) {
                                console.error("Error exporting Stock Excel:", error);
                                alert("Error al generar el reporte de stock.");
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 ring-1 ring-emerald-500"
                        title="Descargar LISTADO DE STOCK"
                    >
                        <Download size={16} />
                        Descargar Reporte Stock
                    </button>
                </div>
                <div className="p-0 overflow-auto max-h-[600px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="py-4 px-6 font-semibold text-xs uppercase tracking-wider">Código</th>
                                <th className="py-4 px-6 font-semibold text-xs uppercase tracking-wider">Descripción del Material</th>
                                <th className="py-4 px-6 text-right font-semibold text-xs uppercase tracking-wider">Stock Disponible</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {summary.filter(row => row.Stock_Almacen > 0).map((row, idx) => (
                                <tr key={idx} className="hover:bg-emerald-50/30 transition-colors group">
                                    <td className="py-3 px-6 text-slate-500 font-mono text-xs">{row.Codigo}</td>
                                    <td className="py-3 px-6 font-medium text-slate-700">{row.Material}</td>
                                    <td className="py-3 px-6 text-right">
                                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                                            {row.Stock_Almacen.toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {summary.filter(row => row.Stock_Almacen > 0).length === 0 && (
                                <tr>
                                    <td colSpan="3" className="py-8 text-center text-slate-400 italic">
                                        No hay materiales en stock actualmente.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}

Dashboard.propTypes = {
    kpis: propTypes.object,
    summary: propTypes.array,
    gestorDist: propTypes.array,
    dailyStats: propTypes.array,
    processDist: propTypes.array,
    pareto: propTypes.array
};
