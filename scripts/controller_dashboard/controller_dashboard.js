// ══════════════════════════════════════════
// DATOS  (reemplaza con tu respuesta PHP/AJAX)
// ══════════════════════════════════════════
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
const MESES_FULL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];

const DATA = {
    norte: {
        mantenimiento: {
            pendiente: [8, 12, 6, 9, 11, 7],
            proceso: [14, 10, 18, 13, 9, 16],
            finalizado: [20, 25, 22, 28, 30, 27],
            vencido: [3, 5, 2, 4, 1, 3]
        },
        auditoria: {
            pendiente: [5, 7, 4, 6, 8, 5],
            proceso: [9, 11, 8, 12, 10, 9],
            finalizado: [15, 18, 16, 20, 22, 19],
            vencido: [2, 3, 1, 2, 3, 1]
        }
    },
    sur: {
        mantenimiento: {
            pendiente: [6, 9, 7, 8, 10, 6],
            proceso: [11, 13, 10, 14, 12, 11],
            finalizado: [18, 21, 19, 24, 26, 22],
            vencido: [4, 6, 3, 5, 2, 4]
        },
        auditoria: {
            pendiente: [4, 6, 5, 7, 6, 4],
            proceso: [8, 9, 7, 10, 9, 8],
            finalizado: [13, 16, 14, 18, 19, 16],
            vencido: [1, 2, 2, 3, 1, 2]
        }
    },
    tampico: {
        mantenimiento: {
            pendiente: [7, 10, 8, 9, 12, 8],
            proceso: [13, 15, 11, 14, 10, 13],
            finalizado: [22, 26, 23, 27, 29, 25],
            vencido: [5, 4, 3, 6, 2, 4]
        },
        auditoria: {
            pendiente: [6, 8, 5, 7, 9, 6],
            proceso: [10, 12, 9, 11, 10, 10],
            finalizado: [17, 20, 18, 22, 24, 20],
            vencido: [3, 2, 2, 4, 1, 3]
        }
    }
};

// Colores que respetan la paleta de Bootstrap / AdminLTE
const COLORES = {
    pendiente: '#ffc107',  // warning
    proceso: '#17a2b8',  // info
    finalizado: '#28a745',  // success
    vencido: '#dc3545'   // danger
};

const ESTADOS_LABEL = {
    pendiente: 'Pendiente',
    proceso: 'En Proceso',
    finalizado: 'Finalizado',
    vencido: 'Vencido'
};

let tipoActual = 'ambos';
let regionActual = 'todas';
let chartInstance = null;

// ══════════════════════════════════════════
// UTILIDADES
// ══════════════════════════════════════════
function sumarArrays(...arrs) {
    return arrs[0].map((_, i) => arrs.reduce((s, a) => s + a[i], 0));
}

function getDataRegion(region, tipo) {
    const tipos = tipo === 'ambos' ? ['mantenimiento', 'auditoria'] : [tipo];
    const result = { pendiente: [], proceso: [], finalizado: [], vencido: [] };
    MESES.forEach((_, i) => {
        ['pendiente', 'proceso', 'finalizado', 'vencido'].forEach(e => {
            result[e].push(tipos.reduce((s, t) => s + DATA[region][t][e][i], 0));
        });
    });
    return result;
}

// ══════════════════════════════════════════
// KPIs
// ══════════════════════════════════════════
function actualizarKPIs() {
    const regiones = regionActual === 'todas' ? ['norte', 'sur', 'tampico'] : [regionActual];
    const tipos = tipoActual === 'ambos' ? ['mantenimiento', 'auditoria'] : [tipoActual];
    const t = { pendiente: 0, proceso: 0, finalizado: 0, vencido: 0 };

    regiones.forEach(r => tipos.forEach(tp => {
        ['pendiente', 'proceso', 'finalizado', 'vencido'].forEach(e => {
            t[e] += DATA[r][tp][e].reduce((a, b) => a + b, 0);
        });
    }));

    document.getElementById('kpi-pendiente').textContent = t.pendiente;
    document.getElementById('kpi-proceso').textContent = t.proceso;
    document.getElementById('kpi-finalizado').textContent = t.finalizado;
    document.getElementById('kpi-vencido').textContent = t.vencido;
}

// ══════════════════════════════════════════
// SERIES PARA APEXCHARTS
// ══════════════════════════════════════════
function construirSeries() {
    return ['pendiente', 'proceso', 'finalizado', 'vencido'].map(e => {
        let data;
        if (regionActual === 'todas') {
            const arrs = ['norte', 'sur', 'tampico'].map(r => getDataRegion(r, tipoActual)[e]);
            data = sumarArrays(...arrs);
        } else {
            data = getDataRegion(regionActual, tipoActual)[e];
        }
        return { name: ESTADOS_LABEL[e], data, color: COLORES[e] };
    });
}

// ══════════════════════════════════════════
// RENDERIZAR GRÁFICA
// ══════════════════════════════════════════
function renderChart() {
    actualizarKPIs();
    actualizarTabla();

    const series = construirSeries();

    const opts = {
        series,
        chart: {
            type: 'bar',
            height: 350,
            background: '#ffffff',
            fontFamily: 'inherit',
            toolbar: {
                show: true,
                tools: {
                    download: true, selection: false, zoom: false,
                    zoomin: false, zoomout: false, pan: false, reset: false
                }
            },
            animations: { enabled: true, easing: 'easeinout', speed: 400 }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '60%',
                borderRadius: 3,
                borderRadiusApplication: 'end',
            }
        },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        xaxis: {
            categories: MESES,
            labels: {
                style: { colors: '#6c757d', fontSize: '12px' }
            },
            axisBorder: { color: '#dee2e6' },
            axisTicks: { color: '#dee2e6' }
        },
        yaxis: {
            labels: {
                style: { colors: '#6c757d', fontSize: '11px' },
                formatter: v => Math.round(v)
            }
        },
        grid: {
            borderColor: '#f0f0f0',
            strokeDashArray: 4,
            xaxis: { lines: { show: false } }
        },
        fill: { opacity: 1 },
        legend: { show: false },
        tooltip: {
            theme: 'light',
            style: { fontSize: '12px' },
            y: { formatter: v => `${v} registros` },
            shared: true,
            intersect: false
        },
        colors: series.map(s => s.color),
        theme: { mode: 'light' }
    };

    if (chartInstance) {
        chartInstance.updateOptions(opts, true, true);
    } else {
        chartInstance = new ApexCharts(document.querySelector('#chart-main'), opts);
        chartInstance.render();
    }
}

// ══════════════════════════════════════════
// TABLA RESUMEN
// ══════════════════════════════════════════
function actualizarTabla() {
    const tbody = document.getElementById('tabla-body');
    const regiones = regionActual === 'todas' ? ['norte', 'sur', 'tampico'] : [regionActual];
    const tipos = tipoActual === 'ambos' ? ['mantenimiento', 'auditoria'] : [tipoActual];
    const etTipo = { mantenimiento: '<i class="fas fa-wrench mr-1"></i>Mantenimiento', auditoria: '<i class="fas fa-clipboard-check mr-1"></i>Auditoría' };

    let filas = '';
    regiones.forEach(r => {
        tipos.forEach(t => {
            MESES_FULL.forEach((mes, i) => {
                const p = DATA[r][t].pendiente[i];
                const pr = DATA[r][t].proceso[i];
                const f = DATA[r][t].finalizado[i];
                const v = DATA[r][t].vencido[i];
                const total = p + pr + f + v;
                filas += `<tr>
                    <td><span class="tag-${r}">${r.charAt(0).toUpperCase() + r.slice(1)}</span></td>
                    <td>${etTipo[t]}</td>
                    <td>${mes}</td>
                    <td><span class="badge badge-pendiente">${p}</span></td>
                    <td><span class="badge badge-proceso">${pr}</span></td>
                    <td><span class="badge badge-finalizado">${f}</span></td>
                    <td><span class="badge badge-vencido">${v}</span></td>
                    <td><strong>${total}</strong></td>
                </tr>`;
            });
        });
    });
    tbody.innerHTML = filas;
}

// ══════════════════════════════════════════
// CONTROLES
// ══════════════════════════════════════════
function setTipo(tipo, btn) {
    tipoActual = tipo;
    // Resetear estilos btn-group
    document.querySelectorAll('.tipo-group .btn').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline-primary');
    });
    btn.classList.remove('btn-outline-primary');
    btn.classList.add('btn-primary');
    actualizarTitulo();
    renderChart();
}

function setRegion(region, link) {
    regionActual = region;
    document.querySelectorAll('.region-pills .nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    actualizarTitulo();
    renderChart();
}

function actualizarTitulo() {
    const rLabel = regionActual === 'todas' ? 'Todas las regiones'
        : regionActual.charAt(0).toUpperCase() + regionActual.slice(1);
    const tLabel = tipoActual === 'ambos' ? 'Mantenimientos &amp; Auditorías'
        : tipoActual === 'mantenimiento' ? 'Mantenimientos' : 'Auditorías';
    document.getElementById('chart-titulo').innerHTML =
        `<i class="fas fa-chart-bar mr-2 text-primary"></i>${rLabel} — ${tLabel}`;
}

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
$(document).ready(function () {
    renderChart();
});