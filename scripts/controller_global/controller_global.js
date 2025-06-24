//*Función para mostrar un alert
function mostrar_alert(tipo, mensaje, skip, funcion) {
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
        backdrop: `
        rgba(0,0,123,0.4)` ,
    }).then((result) => {
        if (result.isConfirmed) {
            // Si el usuario hace clic en "Aceptar", ejecutamos la función que pasamos como parámetro
            funcion();
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

//* Función para validar que los campos no estén vacios (los vuelve obligatorios)
function validar_campos(campos) {
    // Inicializa una variable booleana que indica si todos los campos son válidos
    let valido = true;

    // Recorre cada ID de campo recibido en el array 'campos'
    campos.forEach(id => {
        // Obtiene el elemento del DOM por su ID
        const campo = document.getElementById(id);

        // Si no se encuentra el elemento, se marca como inválido y se sale de la iteración
        if (!campo) return valido = false;

        // Verifica si el campo tiene la clase 'is-required'
        const requerido = $(campo).hasClass('is-required');

        // Verifica si el campo está vacío (sin espacios)
        const vacio = !campo.value.trim();

        // Si el campo está vacío (sea requerido), se marca como inválido
        if ((requerido && vacio) || vacio) {
            // Añade la clase 'is-invalid' para mostrar advertencia visual
            campo.classList.add('is-invalid');
            // Cambia la bandera general a falso (hay al menos un campo inválido)
            valido = false;
        } else {
            // Si el campo no está vacío, se asegura de quitar la clase de advertencia
            campo.classList.remove('is-invalid');
        }

        // Añade un evento al campo para que, al escribir en él,
        // se quite la clase de error si el valor ya no está vacío
        campo.addEventListener('input', () => {
            if (campo.value.trim()) {
                campo.classList.remove('is-invalid');
            }
        });
    });

    // Devuelve true si todos los campos son válidos, o false si alguno es inválido
    return valido;
}

//TODO animando iconos 
$(".icon").on('mouseover', function () {
    $(this).find('i').addClass("fa-bounce");
})
$(".icon").on('mouseout', function (e) {
    $(this).find('i').removeClass("fa-bounce");
})

$(document).on('mouseover', '.icon', function () {
    $(this).find('i').addClass('fa-bounce');
}).on('mouseout', '.icon', function () {
    $(this).find('i').removeClass('fa-bounce');
});

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