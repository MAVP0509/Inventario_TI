//*Función para hacer peticiones http al servidor
function server_dashboard(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_dashboard/controller_dashboard.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (response) {
                try {
                    resolve(JSON.parse(response))
                    //console.log(response)
                } catch (error) {
                    reject(error)
                }
            }
        })
    })
}
//*Mostrar mensaje de bienvenida
window.addEventListener('load', function () {
    //* Lectura del mensaje en localStorage
    const mensajeRegistro = sessionStorage.getItem('bienvenido');

    if (mensajeRegistro) {
        //* Si el mensaje existe, mostramos el toast
        mostrar_toast('success', 'Bienvenido', mensajeRegistro);
        // *Eliminamos el mensaje para evitar que aparezca nuevamente
        sessionStorage.removeItem('bienvenido');
    }

})

//*Función para consultar el último año programado de mantenimiento
async function consultar_anio() {
    //*Generando select2 de los años programados
    await general_select2({
        selectId: 'select-dash',
        tabla: 'mantenimiento',
        campo: 'anio',
        placeholder: 'Selecione un año',
        dropdownParent: '#card-dash',
        tags: false,
    }).then(async () => {
        //*Al finalizar se consulta el último año
        let server = await server_dashboard({ accion: 1 })
        if (!server.resultado) {
            return mostrar_toast('error', 'Error', 'Problema de conexión con el servidor')
        } else {
            //*Se selecciona el último año en el select
            $('#select-dash').val(server.resultado.anio).trigger('change')
        }
    })
}

//* Variables globales con valores por defecto
let tipoActual = 'ambos';
let regionActual = 'Todas';
let chartInstance = null;

//*Variables globales vacías por defecto
let datos
let regionesDisponibles = [];

//*Función para consultar la información del dashboard por año
//*La función se ejecuta al seleccionar una opción en el select
async function consultar_info(anio) {
    //*Al generarse el select ocurre el evento onchange, así se evita su ejecución vacía
    if (anio.value === '') {
        return;
    }
    //*Consulta de la información al servidor
    let server = await server_dashboard({ accion: 0, anio: anio.value });
    datos = server.resultado;

    //* Extraer regiones disponibles 
    regionesDisponibles = datos.regiones || [];


    //*Construir Select2 de regiones dinámicamente
    construirSelectRegion();

    if (regionesDisponibles.length > 1) {
        //*Si hay más de una región selecciona la opción todas
        rellenar_select('Todas', "select-region")
    }else{
        //*Si solo existe una región, se selecciona
        rellenar_select(regionesDisponibles[0],"select-region")
    }

}

//*Arreglos para mostrar la información y recorrer arreglos 
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MESES_FULL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];



//* Colores para la gráfica
const COLORES = {
    pendiente: '#ffc107',
    proceso: '#17a2b8',
    finalizado: '#28a745',
    vencido: '#dc3545'
};

//*Objeto de textos para mostrar la información
const ESTADOS_LABEL = {
    pendiente: 'Pendiente',
    proceso: 'En Proceso',
    finalizado: 'Finalizado',
    vencido: 'Vencido'
};

//* Construir Select2 de regiones 
async function construirSelectRegion() {
    let opciones = []
    if (regionesDisponibles.length > 1) {
        //*Las regiones disponibles se estructuran en un areglo de objetos para generar el select de regiones
        opciones = regionesDisponibles.map((region, index) => ({ id: index + 1, text: region }))
        
        //*Añadido de la opción todas para mostrar todas las regiones
        opciones.unshift({ id: 0, text: 'Todas' })
    } else {
        //*Si solo existe una región no es necesaria la opción todas
        opciones = regionesDisponibles.map((region, index) => ({ id: index, text: region }))
    }

    //*Generación del select
    await general_select2({
        selectId: 'select-region',
        data: opciones,
        placeholder: 'Selecione una región',
        dropdownParent: '#card-dash',
        tags: false,
    })

}



//* Función que suma los indices de un número indefinido de arrays que sean de la misma longitud
function sumarArrays(...arrs) {
    return arrs[0].map((_, index) => arrs.reduce((suma, array) => suma + array[index], 0));
}

//* Filtrar los datos por región, retornando los datos del mantenimiento y auditoria por mes
function getDataRegion(region, tipo) {
    const tipos = tipo === 'ambos' ? ['mantenimiento', 'auditoria'] : [tipo];
    const result = { pendiente: [], proceso: [], finalizado: [], vencido: [] };
    MESES.forEach((_, index) => {
        ['pendiente', 'proceso', 'finalizado', 'vencido'].forEach(estado => {
            result[estado].push(tipos.reduce((suma, tipo) => suma + datos[region][tipo][estado][index] || 0, 0));
        });
    });
    return result;
}

//*Actualizar kpis (cards del principio)
function actualizarKPIs() {

    const regiones = regionActual === 'Todas' ? regionesDisponibles : [regionActual];
    const tipos = tipoActual === 'ambos' ? ['mantenimiento', 'auditoria'] : [tipoActual];
    const valoresKpis = { pendiente: 0, proceso: 0, finalizado: 0, vencido: 0 };

    regiones.forEach(region => {
        //* Validación si se retorna una región sin datos
        if (!datos[region]) {
            console.error(`Región "${region}" no existe en datos`);
            return;
        }

        tipos.forEach(tipo => {
            if (!datos[region][tipo]) {
                console.error(`Tipo "${tipo}" no existe en región "${region}"`);
                return;
            }

            ['pendiente', 'proceso', 'finalizado', 'vencido'].forEach(estado => {
                valoresKpis[estado] += datos[region][tipo][estado].reduce((suma, valor) => suma + valor, 0);
            });
        });
    });
    //*Mostrar los valores en pantalla
    document.getElementById('kpi-pendiente').textContent = valoresKpis.pendiente;
    document.getElementById('kpi-proceso').textContent = valoresKpis.proceso;
    document.getElementById('kpi-finalizado').textContent = valoresKpis.finalizado;
    document.getElementById('kpi-vencido').textContent = valoresKpis.vencido;
}

//*Construyendo los datos para mostrarlos en la gráfica
function construirSeries() {
    return ['pendiente', 'proceso', 'finalizado', 'vencido'].map(estado => {
        let data;
        if (regionActual === 'Todas') {

            const arrs = regionesDisponibles.map(region => getDataRegion(region, tipoActual)[estado]);
            data = sumarArrays(...arrs);
        } else {
            data = getDataRegion(regionActual, tipoActual)[estado];
        }
        return { name: ESTADOS_LABEL[estado], data, color: COLORES[estado] };
    });
}

//*Renderizar gráfica, actualizar kpis y actualizar tabla
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
            animations: { enabled: true, easing: 'easeinout', speed: 400 },
            locales: [{
                name: 'es',
                options: {
                    toolbar: {
                        exportToSVG: 'Descargar SVG',
                        exportToPNG: 'Descargar PNG',
                        exportToCSV: 'Descargar CSV',
                        menu: 'Menú',
                        selection: 'Selección',
                        selectionZoom: 'Zoom de Selección',
                        zoomIn: 'Aumentar',
                        zoomOut: 'Disminuir',
                        pan: 'Panorámica',
                        reset: 'Restablecer Zoom'
                    }
                }
            }],
            defaultLocale: 'es' // Esto activa el español
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

//*Información de la tabla inferior
function actualizarTabla() {
    const tbody = document.getElementById('tabla-body');

    const regiones = regionActual === 'Todas' ? regionesDisponibles : [regionActual];
    const tipos = tipoActual === 'ambos' ? ['mantenimiento', 'auditoria'] : [tipoActual];
    const etTipo = {
        mantenimiento: '<i class="fas fa-wrench mr-1"></i>Mantenimiento',
        auditoria: '<i class="fas fa-clipboard-check mr-1"></i>Auditoría'
    };

    let filas = '';
    regiones.forEach(r => {
        if (!datos[r]) return; // Validar existencia

        tipos.forEach(t => {
            MESES_FULL.forEach((mes, i) => {
                const p = datos[r][t].pendiente[i] || 0;
                const pr = datos[r][t].proceso[i] || 0;
                const f = datos[r][t].finalizado[i] || 0;
                const v = datos[r][t].vencido[i] || 0;
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


//todo Controles del dashboard

//*Controles para mostrar mantenimiento o auditoría o ambos
function setTipo(tipo, btn) {
    tipoActual = tipo;
    //* Resetear estilos btn-group
    document.querySelectorAll('.tipo-group .btn').forEach(boton => {
        boton.classList.remove('btn-primary');
        boton.classList.add('btn-outline-primary');
    });
    btn.classList.remove('btn-outline-primary');
    btn.classList.add('btn-primary');
    actualizarTitulo();
    renderChart();
}


//* Función para manejar cambio de región
function cambiarRegion(select) {
    const region = select.selectedOptions[0].text;
    //*Al generarse el select ocurre el evento onchange, así se evita la primera ejecución
    if(region === ''){
        return
    }
    regionActual = region;
    actualizarTitulo();
    renderChart();
}

//* Función para cambiar el título de la card
function actualizarTitulo() {
    const rLabel = regionActual === 'Todas' ? 'Todas las regiones'
        : regionActual.charAt(0).toUpperCase() + regionActual.slice(1);
    const tLabel = tipoActual === 'ambos' ? 'Mantenimientos &amp; Auditorías'
        : tipoActual === 'mantenimiento' ? 'Mantenimientos' : 'Auditorías';
    document.getElementById('chart-titulo').innerHTML =
        `<i class="fas fa-chart-bar mr-2 text-primary"></i>${rLabel} — ${tLabel}`;
}
