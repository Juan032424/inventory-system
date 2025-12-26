import { useState, useMemo } from 'react';
import { loadData, preprocessData, calculateKPIs, calculateMaterialSummary, calculateGestorDistribution, analyzeDataQuality, getDailyBreakdown, calculateProcessDistribution, calculatePareto } from './utils/dataProcessing';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AuditView from './components/AuditView';
import PowerBIView from './components/PowerBIView';
import ErrorBoundary from './components/ErrorBoundary';
import { Menu, X } from 'lucide-react';

function App() {
    const [rawData, setRawData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Filters State
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedProcesses, setSelectedProcesses] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [selectedGestors, setSelectedGestors] = useState([]);
    const [selectedPeriods, setSelectedPeriods] = useState([]);

    // Handle File Upload
    const handleFileUpload = async (file) => {
        setIsLoading(true);
        try {
            const data = await loadData(file);
            const processed = preprocessData(data);
            setRawData(processed);
            // Reset filters on new file
            setSelectedProcesses([]);
            setSelectedMaterials([]);
            setSelectedGestors([]);
            setSelectedPeriods([]);
            setDateRange({ start: '', end: '' });
        } catch (error) {
            console.error("Error loading file:", error);
            alert("Error parsing Excel file. Check format.");
        } finally {
            setIsLoading(false);
        }
    };

    // Derive Options for Filters
    const options = useMemo(() => {
        if (!rawData.length) return { processes: [], materials: [], gestors: [], periods: [] };

        const processes = [...new Set(rawData.map(r => r.Proceso))].sort();
        const materials = [...new Set(rawData.map(r => r['Items']).filter(Boolean))].sort();
        const periods = [...new Set(rawData.map(r => r.Periodo).filter(p => p !== 'N/A'))].sort().reverse();

        const gestorsSet = new Set();
        rawData.forEach(r => {
            if (r['Nombre Recibe']) gestorsSet.add(r['Nombre Recibe']);
            if (r['Nombre Entrega']) gestorsSet.add(r['Nombre Entrega']);
        });
        const gestors = [...gestorsSet].sort();

        return { processes, materials, gestors, periods };
    }, [rawData]);

    // Apply Filters
    const filteredData = useMemo(() => {
        if (!rawData.length) return [];

        return rawData.filter(row => {
            // Period Filter (Priority)
            if (selectedPeriods.length > 0 && !selectedPeriods.includes(row.Periodo)) return false;

            // Date Filter
            if (dateRange.start && row.Fecha && new Date(row.Fecha) < new Date(dateRange.start)) return false;
            if (dateRange.end && row.Fecha) {
                const endDate = new Date(dateRange.end);
                endDate.setHours(23, 59, 59, 999);
                if (new Date(row.Fecha) > endDate) return false;
            }

            // Process Filter
            if (selectedProcesses.length > 0 && !selectedProcesses.includes(row.Proceso)) return false;

            // Material Filter
            if (selectedMaterials.length > 0 && !selectedMaterials.includes(row['Items'])) return false;

            // Gestor Filter
            if (selectedGestors.length > 0) {
                const involved = [row['Nombre Recibe'], row['Nombre Entrega']];
                if (!selectedGestors.some(g => involved.includes(g))) return false;
            }

            return true;
        });
    }, [rawData, dateRange, selectedProcesses, selectedMaterials, selectedGestors, selectedPeriods]);

    // Derived Data for Views
    const kpis = useMemo(() => calculateKPIs(filteredData), [filteredData]);
    const materialSummary = useMemo(() => calculateMaterialSummary(filteredData), [filteredData]);
    const gestorDist = useMemo(() => calculateGestorDistribution(filteredData), [filteredData]);
    const dailyBreakdown = useMemo(() => getDailyBreakdown(filteredData), [filteredData]);
    const qualityStats = useMemo(() => analyzeDataQuality(filteredData), [filteredData]);
    const processDist = useMemo(() => calculateProcessDistribution(kpis), [kpis]);
    const pareto = useMemo(() => calculatePareto(filteredData), [filteredData]);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onUpload={handleFileUpload}
                options={options}
                filters={{
                    dateRange,
                    selectedProcesses,
                    selectedMaterials,
                    selectedGestors,
                    selectedPeriods
                }}
                setFilters={{
                    setDateRange,
                    setSelectedProcesses,
                    setSelectedMaterials,
                    setSelectedGestors,
                    setSelectedPeriods
                }}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">
                {/* Top Header (Mobile Toggle) */}
                <header className="h-14 border-b border-gray-200 bg-white flex items-center px-4 justify-between lg:hidden shrink-0">
                    <div className="font-bold text-primary">InventorySys</div>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600">
                        {isSidebarOpen ? <X /> : <Menu />}
                    </button>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-6 scroll-smooth bg-slate-50/50">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                                {activeTab === 'dashboard' ? 'Dashboard General' : activeTab === 'audit' ? 'Auditoría de Datos' : 'Reportes Externos'}
                            </h1>
                            <span className="text-sm text-slate-500 font-medium bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
                                {filteredData.length.toLocaleString()} registros
                            </span>
                        </div>

                        {rawData.length === 0 ? (
                            <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 text-slate-400">
                                <p className="text-xl font-medium mb-2">No hay datos cargados</p>
                                <p className="text-sm">Sube un archivo Excel usando el panel lateral</p>
                            </div>
                        ) : (
                            <ErrorBoundary>
                                {activeTab === 'dashboard' ? (
                                    <Dashboard
                                        kpis={kpis}
                                        summary={materialSummary}
                                        gestorDist={gestorDist}
                                        dailyStats={dailyBreakdown}
                                        processDist={processDist}
                                        pareto={pareto}
                                    />
                                ) : activeTab === 'audit' ? (
                                    <AuditView
                                        quality={qualityStats}
                                        dailyBreakdown={dailyBreakdown}
                                        totalRaw={rawData.length}
                                        totalFiltered={filteredData.length}
                                    />
                                ) : (
                                    <PowerBIView />
                                )}
                            </ErrorBoundary>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;
