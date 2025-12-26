import { useState } from 'react';
import { RefreshCw, ExternalLink, Monitor, Maximize2 } from 'lucide-react';
import propTypes from 'prop-types';

export default function PowerBIView() {
    const [reportUrl, setReportUrl] = useState(localStorage.getItem('pbi_url') || '');
    const [isEditing, setIsEditing] = useState(!reportUrl);
    const [tempUrl, setTempUrl] = useState(reportUrl);

    const handleSave = () => {
        setReportUrl(tempUrl);
        localStorage.setItem('pbi_url', tempUrl);
        setIsEditing(false);
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center animate-fade-in">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                        <Monitor size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800">Reporte Power BI</h2>
                        <p className="text-xs text-slate-500">Visualización integrada</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        {isEditing ? 'Cancelar' : 'Cambiar URL'}
                    </button>
                    {reportUrl && (
                        <button
                            onClick={() => setReportUrl(reportUrl)} // Force re-render iframe
                            className="p-2 text-slate-500 hover:text-blue-600 transition-colors"
                            title="Recargar reporte"
                        >
                            <RefreshCw size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Configuration Area (Visible if no URL or Editing) */}
            {isEditing && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 animate-fade-in z-10">
                    <h3 className="font-bold text-slate-700 mb-2">Configurar Reporte</h3>
                    <p className="text-sm text-slate-500 mb-4">Pega aquí el enlace de "Publicar en la web" de Power BI.</p>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            className="flex-1 p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="https://app.powerbi.com/view?r=..."
                            value={tempUrl}
                            onChange={(e) => setTempUrl(e.target.value)}
                        />
                        <button
                            onClick={handleSave}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                        >
                            Ver Reporte
                        </button>
                    </div>
                </div>
            )}

            {/* Iframe Container */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative group">
                {reportUrl ? (
                    <iframe
                        title="Power BI Report"
                        src={reportUrl}
                        className="w-full h-full border-0"
                        allowFullScreen={true}
                    ></iframe>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50">
                        <Monitor size={48} className="mb-4 opacity-50" />
                        <p>No hay reporte configurado</p>
                    </div>
                )}

                {reportUrl && (
                    <a
                        href={reportUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-4 right-4 bg-black/70 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-xs backdrop-blur-md"
                    >
                        <ExternalLink size={14} /> Abrir en pestaña nueva
                    </a>
                )}
            </div>
        </div>
    );
}
