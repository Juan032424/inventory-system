import propTypes from 'prop-types';
import { Upload, Calendar, Layers, Box, Users, LayoutDashboard, FileSearch, ChevronDown, ChevronUp, Search, X, Check, Filter } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

// --- Helper Hook for Click Outside ---
function useClickOutside(ref, handler) {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
}

// --- Accordion Component ---
const AccordionItem = ({ title, icon: Icon, isOpen, onToggle, children, activeCount = 0 }) => (
    <div className="border-b border-blue-800/30 last:border-0">
        <button
            onClick={onToggle}
            className={`w-full flex items-center justify-between p-4 transition-colors ${isOpen ? 'bg-blue-900/20' : 'hover:bg-blue-900/10'}`}
        >
            <div className="flex items-center gap-3 text-blue-100">
                <Icon size={18} className="text-blue-400" />
                <span className="font-medium text-sm">{title}</span>
                {activeCount > 0 && (
                    <span className="bg-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px]">
                        {activeCount}
                    </span>
                )}
            </div>
            {isOpen ? <ChevronUp size={16} className="text-blue-400" /> : <ChevronDown size={16} className="text-blue-500/50" />}
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 bg-slate-900/30">
                {children}
            </div>
        </div>
    </div>
);

// --- Modern MultiSelect Component ---
const ModernMultiSelect = ({ label, options, selected = [], onChange, enableSearch = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    useClickOutside(dropdownRef, () => setIsOpen(false));

    const filteredOptions = options.filter(opt =>
        opt.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleOption = (opt) => {
        if (selected.includes(opt)) {
            onChange(selected.filter(item => item !== opt));
        } else {
            onChange([...selected, opt]);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all duration-200 ${isOpen
                    ? 'bg-blue-600/10 border-blue-500 text-blue-100 ring-1 ring-blue-500/50'
                    : 'bg-slate-800/50 border-blue-900/50 text-slate-300 hover:border-blue-700 hover:bg-slate-800'
                    }`}
            >
                <span className="truncate max-w-[180px]">
                    {selected.length === 0
                        ? `Seleccionar ${label}...`
                        : selected.length === 1
                            ? selected[0]
                            : `${selected.length} seleccionados`}
                </span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : 'text-slate-500'}`} />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#1e293b] border border-blue-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {/* Search Bar */}
                    {enableSearch && (
                        <div className="p-2 border-b border-blue-800/50 bg-slate-900/50 sticky top-0">
                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-2.5 text-blue-400" />
                                <input
                                    type="text"
                                    placeholder={`Buscar ${label}...`}
                                    className="w-full bg-slate-800 text-xs text-blue-100 pl-8 pr-3 py-2 rounded-lg border border-blue-900 focus:outline-none focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    {/* Options List */}
                    <div className="max-h-56 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-transparent">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => {
                                const isSelected = selected.includes(opt);
                                return (
                                    <div
                                        key={opt}
                                        onClick={() => toggleOption(opt)}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${isSelected
                                            ? 'bg-blue-600/20 text-blue-100'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-blue-200'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected
                                            ? 'bg-blue-600 border-blue-500'
                                            : 'border-slate-600 bg-slate-800'
                                            }`}>
                                            {isSelected && <Check size={10} className="text-white" />}
                                        </div>
                                        <span className="truncate">{opt}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-4 text-center text-xs text-slate-500 italic">
                                No se encontraron resultados
                            </div>
                        )}
                    </div>

                    {/* Actions Footer */}
                    <div className="p-2 border-t border-blue-800/50 bg-slate-900/50 flex justify-between items-center text-[10px]">
                        <span className="text-slate-500">{selected.length} seleccionados</span>
                        {selected.length > 0 && (
                            <button
                                onClick={() => onChange([])}
                                className="text-blue-400 hover:text-white font-medium hover:underline px-2"
                            >
                                Limpiar Filtros
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main Sidebar Component ---
export default function Sidebar({ isOpen, onUpload, options, filters, setFilters, activeTab, setActiveTab }) {
    const fileInputRef = useRef(null);
    const [openSections, setOpenSections] = useState({
        period: true,
        process: true,
        material: false,
        gestor: false
    });

    const toggleSection = (key) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) onUpload(file);
    };

    const hasActiveFilters =
        filters.selectedPeriods?.length > 0 ||
        filters.selectedProcesses?.length > 0 ||
        filters.selectedMaterials?.length > 0 ||
        filters.selectedGestors?.length > 0 ||
        filters.dateRange.start || filters.dateRange.end;

    return (
        <aside className={`
            fixed lg:static inset-y-0 left-0 z-50 w-80 bg-[#0f172a] text-white transition-transform duration-300 border-r border-blue-900/50
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
            flex flex-col h-full shadow-2xl shadow-blue-900/20
        `}>
            {/* Header / Logo */}
            <div className="h-20 flex items-center px-6 border-b border-blue-800/50 bg-[#1e293b]/50 backdrop-blur-md">
                <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center p-0.5 shadow-lg shadow-blue-500/20 shrink-0 ring-1 ring-white/10">
                        <img src="/Logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-lg mix-blend-overlay opacity-90" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg tracking-tight leading-none text-white font-heading">Inventory<span className="text-blue-400">Pro</span></span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] text-blue-300/80 uppercase tracking-widest font-medium">Online v2.5</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs (Pills) */}
            <div className="p-4">
                <div className="bg-slate-900/50 p-1 rounded-xl border border-blue-900/30 flex gap-1">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2
                            ${activeTab === 'dashboard'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 ring-1 ring-blue-500/50'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'}
                        `}
                    >
                        <LayoutDashboard size={16} />
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('audit')}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2
                            ${activeTab === 'audit'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 ring-1 ring-blue-500/50'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'}
                        `}
                    >
                        <FileSearch size={16} />
                        Data
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-800 scrollbar-track-transparent">

                {/* Upload Section - Collapsible or Compact */}
                <div className="px-5 mb-6">
                    <div
                        className="group relative border border-dashed border-blue-700/50 bg-blue-500/5 rounded-xl p-5 text-center cursor-pointer hover:bg-blue-600/10 hover:border-blue-500 transition-all duration-300"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                        <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />

                        <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                            <Upload size={18} />
                        </div>
                        <p className="text-sm font-semibold text-blue-100 group-hover:text-white transition-colors">Cargar Nuevo Archivo</p>
                        <p className="text-[10px] text-blue-400/70 mt-0.5">Soporta .xlsx y .xls</p>
                    </div>
                </div>

                {/* Filters Header */}
                <div className="px-5 py-2 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                        <Filter size={14} /> Filtros Activos
                    </h3>
                    {hasActiveFilters && (
                        <button
                            onClick={() => {
                                setFilters.setDateRange({ start: '', end: '' });
                                setFilters.setSelectedProcesses([]);
                                setFilters.setSelectedMaterials([]);
                                setFilters.setSelectedGestors([]);
                                setFilters.setSelectedPeriods([]);
                            }}
                            className="text-[10px] text-red-400 hover:text-red-300 hover:underline transition-colors"
                        >
                            Borrar todo
                        </button>
                    )}
                </div>

                {/* Accordion Filters */}
                <div className="space-y-px bg-slate-900/20 border-y border-blue-900/30">

                    {/* Date Range - Special Custom Layout */}
                    <AccordionItem
                        title="Rango de Fechas"
                        icon={Calendar}
                        isOpen={openSections.period}
                        onToggle={() => toggleSection('period')}
                        activeCount={(filters.dateRange.start || filters.dateRange.end) ? 1 : 0}
                    >
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-blue-400 font-medium ml-1">DESDE</label>
                                    <input
                                        type="date"
                                        className="w-full text-xs p-2 bg-slate-800 border border-blue-900/50 text-white rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        value={filters.dateRange.start}
                                        onChange={(e) => setFilters.setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-blue-400 font-medium ml-1">HASTA</label>
                                    <input
                                        type="date"
                                        className="w-full text-xs p-2 bg-slate-800 border border-blue-900/50 text-white rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        value={filters.dateRange.end}
                                        onChange={(e) => setFilters.setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    />
                                </div>
                            </div>
                            {/* Period Select inside Date Section for logic grouping */}
                            <div className="pt-2 border-t border-blue-800/30">
                                <label className="text-[10px] text-blue-400 font-medium ml-1 mb-1 block">PERIODO (Opcional)</label>
                                <ModernMultiSelect
                                    label="Periodo"
                                    options={options.periods || []}
                                    selected={filters.selectedPeriods || []}
                                    onChange={setFilters.setSelectedPeriods}
                                />
                            </div>
                        </div>
                    </AccordionItem>

                    <AccordionItem
                        title="Procesos"
                        icon={Layers}
                        isOpen={openSections.process}
                        onToggle={() => toggleSection('process')}
                        activeCount={filters.selectedProcesses.length}
                    >
                        <ModernMultiSelect
                            label="Tipo de Proceso"
                            options={options.processes}
                            selected={filters.selectedProcesses}
                            onChange={setFilters.setSelectedProcesses}
                        />
                    </AccordionItem>

                    <AccordionItem
                        title="Material / Items"
                        icon={Box}
                        isOpen={openSections.material}
                        onToggle={() => toggleSection('material')}
                        activeCount={filters.selectedMaterials.length}
                    >
                        <ModernMultiSelect
                            label="Material"
                            options={options.materials}
                            selected={filters.selectedMaterials}
                            onChange={setFilters.setSelectedMaterials}
                            enableSearch={true}
                        />
                        <p className="text-[10px] text-slate-500 mt-2 italic px-1">
                            Use el buscador para filtrar entre {options.materials.length} materiales.
                        </p>
                    </AccordionItem>

                    <AccordionItem
                        title="Gestores"
                        icon={Users}
                        isOpen={openSections.gestor}
                        onToggle={() => toggleSection('gestor')}
                        activeCount={filters.selectedGestors.length}
                    >
                        <ModernMultiSelect
                            label="Gestor"
                            options={options.gestors}
                            selected={filters.selectedGestors}
                            onChange={setFilters.setSelectedGestors}
                            enableSearch={true}
                        />
                    </AccordionItem>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-blue-800/30 bg-[#0f172a] text-[10px] text-center text-blue-500/60">
                <p className="hover:text-blue-400 transition-colors cursor-default">© 2025 InventoryPro System v3.0</p>
            </div>
        </aside>
    );
}

Sidebar.propTypes = {
    isOpen: propTypes.bool,
    onUpload: propTypes.func,
    options: propTypes.object,
    filters: propTypes.object,
    setFilters: propTypes.object,
    activeTab: propTypes.string,
    setActiveTab: propTypes.func
};
