function server_global(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_global/controller_global.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (respose) {
                try {
                    resolve(JSON.parse(respose))
                } catch (error) {
                    reject(error)
                }
            }
        })
    })
}

function rellenar_select(texto, select) {
    let textoBuscado = texto;
    let $select = $('#' + select);

    $select.find('option').filter(function () {
        return $(this).text().trim() === textoBuscado;
    }).prop('selected', true);

    $select.trigger('change');
}

//*Función para mostrar un alert
function mostrar_alert(tipo, mensaje, skip, funcion, denyButton, denyButtonText, denyFuction) {
    Swal.fire({
        title: 'Inventario TI',
        text: mensaje,
        icon: tipo, // 'success', 'error', 'warning', 'info', 'question'
        showCancelButton: true,
        confirmButtonColor: '#0000FF',
        allowOutsideClick: skip, // true, false
        cancelButtonColor: '#FF0000',
        confirmButtonText: 'Aceptar <i class="fa-solid fa-circle-check fa-lg">',
        cancelButtonText: 'Cancelar <i class="fa-solid fa-xmark fa-lg"></i>',
        reverseButtons: true, //* 👉 Esto cambia el orden de los botones
        showDenyButton: denyButton,
        denyButtonText: denyButtonText,
        backdrop: `
        rgba(0,0,123,0.4)` ,
    }).then((result) => {
        if (result.isConfirmed) {
            // Si el usuario hace clic en "Aceptar", ejecutamos la función que pasamos como parámetro
            funcion();
        } else if (result.isDenied) {
            denyFuction();
        }
    })
}

//*Función para mostrar un toast
function mostrar_toast(tipo, titulo, mensaje, tiempo) {
    Swal.fire({
        icon: tipo, // Tipo de ícono : 'success', 'error', 'warning', 'info', 'question'
        title: titulo, // Tetxo que se mostrará como título del toast
        html: mensaje, // Contenido del mensaje, se permite HTML
        timer: tiempo || 2500, // Duración del toast en milisegundos (por defecto 2500)
        timerProgressBar: true, // Muestra una barra de progreso durante el tiempo
        showConfirmButton: false, // No se muestra el botón de "Aceptar"
        toast: true, // Habilita el modo toast (pequeño, en una esquina)
        position: 'top-end', // Posición del toast (derecha superior)
        heightAuto: true, // Ajusta automáticamente la altura según el contenido
    });
}

//* Función pAra mostrar notificación de carga
function mostrar_toast_cargando(texto) {
    Swal.fire({ // Se invoca SweetAlert2 para crear el toast
        toast: true,    // Define el tipo de toast (alerta no modal)
        position: 'top-end',    // Posición del toast en la pantalla
        showConfirmButton: false,   //Oculta el botón de confirmación
        showCloseButton: false, // Oculta el botón de cerrar
        timer: undefined, // Evita el cierre automático del toast
        allowOutsideClick: false,   // Bloquea el cierre al hacer clic fuera del toast
        background: '#fff', // Define el color de fondo
        // HTML perzonalizado que se mostrará dentro del toast
        html: `
            <div style="display: flex; align-items: center;">
                <!--<i class="fas fa-spinner fa-spin fa-lg" style="margin-right: 10px; color: #007bff;"></i>-->
                <img src="images/circles.svg" alt="Icono" height="30" width="30">
                <span style="font-weight: 500; margin-left: 8px;">${texto}</span>
            </div>
        `,
        // Evento que se ejecuta al abrir el toast
        didOpen: () => {
            //Swal.showLoading(); Esto muestra el spinner por default de SweetAlert, pero ya no es necesario, ya que se usa uno de fontAwesome
        }
    });
}

/* let toastCargandoTimer = null;
let toastCargandoInterval = null;

//* Función global para mostrar notificación de carga
function mostrar_toast_cargando(texto, opciones = {}) {

    const {
        delay = 4000,
        mensajesLargos = [
            'Espere mientras se completa la operación...',
            'Esto puede demorar un poco, por favor espere...'
        ],
        alternar = true
    } = opciones;

    // Limpia timers anteriores (por seguridad)
    clearTimeout(toastCargandoTimer);
    clearInterval(toastCargandoInterval);

    Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        showCloseButton: false,
        timer: undefined,
        allowOutsideClick: false,
        background: '#fff',
        html: `
            <div style="display: flex; align-items: center;">
                <img src="images/circles.svg" alt="Icono" height="30" width="30">
                <span id="toast-cargando-texto" style="font-weight: 500; margin-left: 8px;">
                    ${texto}
                </span>
            </div>
        `,
        didOpen: () => {

            // Cambia el mensaje después de cierto tiempo
            toastCargandoTimer = setTimeout(() => {

                if (!Swal.isVisible()) return;

                if (alternar && mensajesLargos.length > 1) {
                    let index = 0;

                    toastCargandoInterval = setInterval(() => {
                        if (!Swal.isVisible()) {
                            clearInterval(toastCargandoInterval);
                            return;
                        }

                        document.getElementById('toast-cargando-texto').innerText =
                            mensajesLargos[index];

                        index = (index + 1) % mensajesLargos.length;

                    }, 5000);

                } else if (mensajesLargos.length > 0) {
                    document.getElementById('toast-cargando-texto').innerText =
                        mensajesLargos[0];
                }

            }, delay);
        }
    });
} */

//* Función para validar que los campos no estén vacios (los vuelve obligatorios)
function validar_campos(campos) {
    // Inicializa una variable booleana que indica si todos los campos son válidos
    let valido = true;

    // Recorre cada ID de campo recibido en el array 'campos'
    campos.forEach(id => {
        // Obtiene el elemento del DOM por su ID
        const $campo = $('#' + id);

        /*  if ($campo.length === 0) {
             valido = false
             return;
         } */

        // Si no se encuentra el elemento, se marca como inválido y se sale de la iteración
        if (!$campo) return valido = false;

        // Verifica si el campo tiene la clase 'is-required'
        const requerido = $campo.hasClass('is-required');

        // Verifica si el campo está vacío (sin espacios)
        const vacio = !$campo.val().trim();

        // Si el campo está vacío (sea requerido), se marca como inválido
        if ((requerido && vacio) || vacio) {
            // Añade la clase 'is-invalid' para mostrar advertencia visual
            $campo.addClass('is-invalid');
            // Cambia la bandera general a falso (hay al menos un campo inválido)
            valido = false;
        } else {
            // Si el campo no está vacío, se asegura de quitar la clase de advertencia
            $campo.removeClass('is-invalid');
        }

        // Añade un evento al campo para que, al escribir en él,
        // se quite la clase de error si el valor ya no está vacío
        $campo.on('input.validacion', () => {
            if ($campo.val().trim()) {
                $campo.removeClass('is-invalid');
            }
        });
    });

    // Devuelve true si todos los campos son válidos, o false si alguno es inválido
    return valido;
}

//* Función para seleccionar/desceccionar uno o varios elementos
function seleccionar_registro(id, lista) {
    // Retorna el primer índice en el que se puede encontrar un elemento dado en el array.
    let index = lista.indexOf(id);
    // ó retorna -1 si el elemento no está presente.
    if (index === -1) {
        lista.push(id); // Añade uno o más elementos al final de un array
    } else {
        lista.splice(index, 1); // Si ya existe, lo elimina del arreglo
    }
    // Nota: Esta función no devuelve valor, modifica la lista directamente
    // console.log(lista)
}

//* Función para inicializar componentes Select2
async function general_select2({ selectId, tabla, campo, data, placeholder, dropdownParent, tags, popoverTitle, popoverContent, placement, sincronizarCon, sincronizarCampo, multiple = false }) {

    let opciones = [];

    if (data && Array.isArray(data)) {
        // Si se pasan los datos directamente
        opciones = data.map(item => ({
            id: item.id ?? '',
            text: item.text ?? ''

        }));

    } else if (tabla && campo) {
        let response = await server_global({
            accion: 0,
            tabla: tabla,
            campo: campo
        });
        //console.log('Respuesta del servidor para select2:', response);
        opciones = response.resultado.map(item => ({
            id: item.id || '',
            text: item[campo] || ''
        }));

    }

    const $select = $('#' + selectId);

    if (multiple) {
        $select.attr('multiple', 'multiple');
    } else {
        $select.removeAttr('multiple');
    }

    // $select.addClass('form-control select2bs4');
    $select.empty().append(new Option('', '', false, false));

    $select.select2({
        theme: 'bootstrap4',
        allowClear: true,
        placeholder: placeholder,
        tags: tags,
        dropdownParent: $(dropdownParent),
        data: opciones
    });

    // Para múltiples valores, se asigna [] como valor inicaial (No toma el estilo de Boostrap 4)
    $select.val(multiple ? [] : null).trigger('change');

    //  Si se pasan datos de popover, aplicarlo
    if (popoverTitle && popoverContent) {
        const $select2Container = $select.next('.select2-container');

        $select2Container.attr({
            'data-toggle': 'popover',
            'data-trigger': 'hover',
            'data-html': 'true',
            'title': popoverTitle,
            'data-content': popoverContent,
            'data-placement': placement
        });

        $select2Container.popover();
    }

    // Sincronización aútomatica
    if (sincronizarCon && sincronizarCampo) {
        const origen = $(`#${sincronizarCon}`);
        const destino = $(`#${selectId}`);

        // Limpia eventos anteriores
        origen.off(`change.sync-${selectId}`);

        // Evento para habilitar/deshabilitar el destino según si es un tag (nuevo valor)
        origen.on(`change.sync-${selectId}`, async function () {
            const selectedOption = origen.find('option:selected');
            const isTag = selectedOption.length && selectedOption.attr('data-select2-tag');
            const valor = origen.val();

            if (valor && isTag) {
                destino.prop('disabled', false).val(null).trigger('change');
            } else {
                destino.prop('disabled', true).val(null).trigger('change');

                // Si quieres que además se sincronice el valor del destino con el origen (cuando no es tag):
                if (valor && !isTag) {
                    // Buscar el cargo relacionado y ponerlo como opción seleccionada
                    let response = await server_global({
                        accion: 0,
                        tabla: tabla,
                        campo: sincronizarCampo,
                        id: valor,
                    });

                    const registro = response?.resultado?.[0];
                    const texto_destino = registro?.[sincronizarCampo];

                    if (texto_destino) {
                        const nueva_opcion = new Option(texto_destino, texto_destino, true, true);
                        destino.append(nueva_opcion).trigger('change');
                    } else {
                        destino.val(null).trigger('change');
                    }
                }
            }
        });
    }

}

//TODO animando iconos 
/* $(".icon").on('mouseover', function () {
    $(this).find('i').addClass("fa-bounce");
})
$(".icon").on('mouseout', function (e) {
    $(this).find('i').removeClass("fa-bounce");
}) */

$(document).on('mouseover', '.icon', function () {
    $(this).find('i').addClass('fa-bounce');
}).on('mouseout', '.icon', function () {
    $(this).find('i').removeClass('fa-bounce');
});

//TODO Animando icono de enviar correo

$(document).on('mouseover', '.envelope', function () {
    $(this).find('i').removeClass('fa-solid fa-envelope').addClass('fa-solid fa-envelope-open-text');
})
$(document).on('mouseout', '.envelope', function () {
    $(this).find('i').removeClass('fa-solid fa-envelope-open-text ').addClass('fa-solid fa-envelope')
})

//todo Animando modals
$(document).ready(function () {
    // Cambia aquí el tipo de animaciones que quieres
    const entrada = 'animate__backInDown';
    const salida = 'animate__backOutDown';

    // Para rastrear si un modal está en proceso de cerrar
    const modalesEnCierre = {};

    // Animación de entrada
    $(document).on('show.bs.modal', '.modal', function () {
        const $modal = $(this);
        const $dialog = $modal.find('.modal-dialog');

        modalesEnCierre[$modal.attr('id')] = false;

        $dialog
            .removeClass(`animate__animated ${salida}`)
            .addClass(`animate__animated ${entrada}`);
    });

    // Animación de salida
    $(document).on('hide.bs.modal', '.modal', function (e) {
        const $modal = $(this);
        const id = $modal.attr('id');
        const $dialog = $modal.find('.modal-dialog');

        if (!modalesEnCierre[id]) {
            e.preventDefault(); // Detener cierre inmediato
            modalesEnCierre[id] = true;

            $dialog
                .removeClass(entrada)
                .addClass(salida);

            // Cierra después de la animación
            setTimeout(() => {
                $modal.modal('hide');
            }, 500); // duración de la animación
        }
    });

    // Limpieza de clases después del cierre
    $(document).on('hidden.bs.modal', '.modal', function () {
        const $dialog = $(this).find('.modal-dialog');
        $dialog.removeClass(`animate__animated ${salida}`);
    });
});

//* Función para mostrar alerta de carga
function alert_cargando(text) {
    Swal.fire({
        title: 'Cargando...',
        text: text || 'Por favor espere un momento',
        allowOutsideClick: false,
        allowEscapeKey: false,
        heightAuto: false,
        color: "#716add",
        backdrop: `
        rgba(0,0,123,0.4)` ,
        imageUrl: "images/diavaz.png",
        imageWidth: 200,
        imageHeight: 200,
        imageAlt: "Custom image",
        didOpen: () => {
            Swal.showLoading();
        }

    });
}

//todo comprobando los mantenimientos vencidos para notificarlos
// $(window).on('load',consultar_mantenimientos_vencidos);
window.addEventListener('load', () => {
    consultar_mantenimientos_vencidos();
    consultar_auditorias_vencidos();
})

async function consultar_mantenimientos_vencidos() {
    const alert = sessionStorage.getItem('alert-mnto')
    let server = await server_global({ accion: 1 })

    if (server.resultado.total_vencidos  >= 1) {
        $('[name=notificacion-numero-mantenimientos]').remove()

        $('#aviso-badge-pestaña-mantenimiento').text(server.resultado.total_vencidos)
        $('[name="aviso-badge-campana"]').text(server.resultado.total_vencidos)
        $('[name="header-campana-notificacion"]').text('Tienes '+server.resultado.total_vencidos + (server.resultado.total_vencidos == 1 ? ' notificación' : ' notificaciones'))
        $('[name="header-divider-campana-notificacion"]').after(`
                                                            <a href="mantenimientos.html" class="dropdown-item" name="notificacion-numero-mantenimientos">
                                                            <i class="fa-solid fa-screwdriver-wrench"></i>
                                                            <span class="float-right text-muted text-sm">${server.resultado.total_vencidos + (server.resultado.total_vencidos == 1 ? ' Mantenimiento vencido' : ' Mantenimientos vencidos')}</span>
                                                            <div class="dropdown-divider"></div></a>`)

/*         if(alert){
            sessionStorage.removeItem('alert-mnto')
            mostrar_alert('warning',`Hay ${server.resultado.total_vencidos + (server.resultado.total_vencidos == 1 ? ' Mantenimiento vencido' : ' Mantenimientos vencidos')} `)
            
        } */
        
    } else {
        return
    }
}

async function consultar_auditorias_vencidos() {
    const alert = sessionStorage.getItem('alert-mnto')
    let server = await server_global({ accion: 1 })

    if (server.resultado.total_vencidos  >= 1) {
        $('[name=notificacion-numero-auditorias]').remove()

        $('#aviso-badge-pestaña-mantenimiento').text(server.resultado.total_vencidos)
        $('[name="aviso-badge-campana"]').text(server.resultado.total_vencidos)
        $('[name="header-campana-notificacion"]').text('Tienes '+server.resultado.total_vencidos + (server.resultado.total_vencidos == 1 ? ' notificación' : ' notificaciones'))
        $('[name="header-divider-campana-notificacion"]').after(`
                                                            <a href="auditorias.html" class="dropdown-item" name="notificacion-numero-auditoria">
                                                            <i class="fa-solid fa-screwdriver-wrench"></i>
                                                            <span class="float-right text-muted text-sm">${server.resultado.total_vencidos + (server.resultado.total_vencidos == 1 ? ' Auditoria vencido' : ' Auditorias vencidos')}</span>
                                                            <div class="dropdown-divider"></div></a>`)
        
    } else {
        return
    }
}
