import { read, utils } from 'xlsx';

/**
 * Loads and parses the Excel file.
 * @param {File} file - The uploaded file object.
 * @returns {Promise<Array<Object>>} - The parsed data as an array of objects.
 */
export const loadData = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = read(data, { type: 'array', cellDates: true });

                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                let jsonData = utils.sheet_to_json(worksheet, { defval: null });

                // Standardize keys and robust parsing
                jsonData = jsonData.map(row => {
                    const newRow = {};
                    Object.keys(row).forEach(key => {
                        newRow[key.trim()] = row[key];
                    });
                    return newRow;
                });

                jsonData.forEach(row => {
                    ['Entrada', 'Salida', 'Cantidad'].forEach(col => {
                        if (row[col] !== undefined && row[col] !== null) {
                            row[col] = parseFloat(row[col]) || 0;
                        } else {
                            row[col] = 0;
                        }
                    });

                    // ROBUST DATE PARSING
                    if (row['Fecha']) {
                        let d = null;
                        // 1. Try passing directly if it's already a Date object
                        if (row['Fecha'] instanceof Date && !isNaN(row['Fecha'])) {
                            d = row['Fecha'];
                        }
                        // 2. Try parsing string formats common in LatAm (DD/MM/YYYY)
                        else if (typeof row['Fecha'] === 'string') {
                            const parts = row['Fecha'].match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
                            if (parts) {
                                // parts[1]=Day, parts[2]=Month, parts[3]=Year
                                d = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
                            } else {
                                // Fallback to standard parser
                                const standardD = new Date(row['Fecha']);
                                if (!isNaN(standardD)) d = standardD;
                            }
                        }
                        // 3. Handle Excel serial numbers (if library returns raw numbers)
                        else if (typeof row['Fecha'] === 'number') {
                            d = new Date(Math.round((row['Fecha'] - 25569) * 86400 * 1000));
                        }

                        // Final Validity Check & Timezone Strip
                        if (d && !isNaN(d.getTime())) {
                            d.setHours(12, 0, 0, 0); // Avoid timezone shifts affecting date
                            row['Fecha'] = d;
                        } else {
                            row['Fecha'] = null;
                        }
                    }
                });

                resolve(jsonData);
            } catch (err) {
                console.error("Data Load Error:", err);
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};

export const preprocessData = (data) => {
    return data.map(row => {
        let procesoRaw = String(row['Proceso'] || '').toUpperCase().trim();
        let proceso = 'Sin Proceso';

        if (procesoRaw.includes('ENTRADA')) proceso = 'Entrada';
        else if (procesoRaw.includes('SALIDA')) proceso = 'Salida';
        else if (procesoRaw.includes('DEVOLUC')) proceso = 'Devolucion';
        else if (procesoRaw.includes('LEGALIZA')) proceso = 'Legalizado';

        // Calculate Periodo (YYYYMM)
        let periodo = 'N/A';
        if (row['Fecha'] && row['Fecha'] instanceof Date && !isNaN(row['Fecha'])) {
            const yyyy = row['Fecha'].getFullYear();
            const mm = String(row['Fecha'].getMonth() + 1).padStart(2, '0');
            periodo = `${yyyy}${mm}`;
        }

        return { ...row, Proceso: proceso, Periodo: periodo };
    });
};

export const calculateKPIs = (data) => {
    const kpis = {
        Material_Recibido: 0,
        Material_Distribuido: 0,
        Devoluciones: 0,
        Legalizaciones: 0,
        Stock_Almacen: 0,
        Stock_Calle: 0,
        Total_Movimientos: data.length
    };

    data.forEach(row => {
        const qty = row['Cantidad'] || 0;
        switch (row['Proceso']) {
            case 'Entrada': kpis.Material_Recibido += qty; break;
            case 'Salida': kpis.Material_Distribuido += qty; break;
            case 'Devolucion': kpis.Devoluciones += qty; break;
            case 'Legalizado': kpis.Legalizaciones += qty; break;
        }
    });

    kpis.Stock_Almacen = kpis.Material_Recibido + kpis.Devoluciones - kpis.Material_Distribuido;
    kpis.Stock_Calle = kpis.Material_Distribuido - kpis.Devoluciones - kpis.Legalizaciones;

    return kpis;
};

export const calculateMaterialSummary = (data) => {
    const grouped = {};

    data.forEach(row => {
        const code = row['Codigo Material'] || 'N/A';
        const name = row['Items'] || 'Unknown';
        const key = `${code}|${name}`;

        if (!grouped[key]) {
            grouped[key] = {
                Codigo: code,
                Material: name,
                Ingresado: 0,
                Entregado: 0,
                Devoluciones: 0,
                Legalizaciones: 0
            };
        }

        const qty = row['Cantidad'] || 0;
        switch (row['Proceso']) {
            case 'Entrada': grouped[key].Ingresado += qty; break;
            case 'Salida': grouped[key].Entregado += qty; break;
            case 'Devolucion': grouped[key].Devoluciones += qty; break;
            case 'Legalizado': grouped[key].Legalizaciones += qty; break;
        }
    });

    return Object.values(grouped).map(item => ({
        ...item,
        Stock_Almacen: item.Ingresado + item.Devoluciones - item.Entregado,
        Stock_Calle: item.Entregado - item.Devoluciones - item.Legalizaciones
    }));
};

export const calculateGestorDistribution = (data) => {
    const grouped = {};

    data.forEach(row => {
        let gestor = null;
        let type = null; // 'Entregado' or 'Legalizado'
        const qty = row['Cantidad'] || 0;

        if (row['Proceso'] === 'Salida') {
            gestor = row['Nombre Recibe'];
            type = 'Entregado';
        } else if (row['Proceso'] === 'Legalizado') {
            gestor = row['Nombre Entrega'];
            type = 'Legalizado';
        }

        if (gestor) {
            if (!grouped[gestor]) grouped[gestor] = { Gestor: gestor, Entregado: 0, Legalizado: 0 };
            if (type === 'Entregado') grouped[gestor].Entregado += qty;
            if (type === 'Legalizado') grouped[gestor].Legalizado += qty;
        }
    });

    return Object.values(grouped)
        .sort((a, b) => b.Entregado - a.Entregado);
};

export const analyzeDataQuality = (data) => {
    const quality = {
        total_rows: data.length,
        unique_dates: new Set(data.filter(r => r.Fecha && !isNaN(r.Fecha)).map(r => r.Fecha.toDateString())).size,
        process_counts: {},
        null_dates: 0,
        null_cantidad: 0
    };

    data.forEach(row => {
        quality.process_counts[row['Proceso']] = (quality.process_counts[row['Proceso']] || 0) + 1;
        if (!row['Fecha'] || isNaN(row['Fecha'])) quality.null_dates++;
        if (row['Cantidad'] === undefined || row['Cantidad'] === null) quality.null_cantidad++;
    });
    return quality;
};

export const getDailyBreakdown = (data) => {
    if (!data.length) return [];

    const daily = {};

    data.forEach(row => {
        if (!row['Fecha'] || !(row['Fecha'] instanceof Date) || isNaN(row['Fecha'].getTime())) return;

        try {
            const dateStr = row['Fecha'].toISOString().split('T')[0];

            if (!daily[dateStr]) daily[dateStr] = {};
            if (!daily[dateStr][row['Proceso']]) daily[dateStr][row['Proceso']] = 0;

            daily[dateStr][row['Proceso']] += (row['Cantidad'] || 0);
        } catch (e) {
            // Ignore invalid dates
        }
    });

    return Object.entries(daily).map(([date, counts]) => ({
        name: date,
        ...counts
    })).sort((a, b) => new Date(a.name) - new Date(b.name));
};

export const calculateProcessDistribution = (kpis) => {
    // Returns data for a Donut Chart
    return [
        { name: 'Stock Almacén', value: kpis.Stock_Almacen, color: '#1e3a8a' }, // Dark Blue (Blue-900)
        { name: 'En Gestores', value: kpis.Stock_Calle, color: '#3b82f6' },   // Primary Blue (Blue-500)
        { name: 'Legalizado', value: kpis.Legalizaciones, color: '#93c5fd' }, // Light Blue (Blue-300)
        { name: 'Devuelto', value: kpis.Devoluciones, color: '#cbd5e1' }      // Grey (Slate-300)
    ].filter(i => i.value > 0);
};

export const calculatePareto = (data) => {
    // 1. Group by Material and sum Quantities (Absolute volume of movement)
    const materialCounts = {};
    data.forEach(row => {
        const key = row['Items'] || 'Desconocido';
        materialCounts[key] = (materialCounts[key] || 0) + (row['Cantidad'] || 0);
    });

    // 2. Convert to array and sort DESC
    const sorted = Object.entries(materialCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // 3. Calculate Cumulative Percentage
    const total = sorted.reduce((sum, item) => sum + item.value, 0);
    let runningSum = 0;

    return sorted.slice(0, 20).map(item => { // Top 20 for readability
        runningSum += item.value;
        return {
            ...item,
            cumPercentage: Math.round((runningSum / total) * 100)
        };
    });
};
