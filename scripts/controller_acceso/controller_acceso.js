//* Verificamos si el usuario está autenticado
if (sessionStorage.getItem('log') !== 'true') {
  //* Si no está autenticado, redirigimos a login.html
  window.location.href = 'login.html';
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

//TODO Animando icono de salir
$("#log-out").on('mouseover', function () {
  $(this).find('i').removeClass('fa-solid fa-door-closed fa-lg').addClass('fa-solid fa-door-open fa-xl');
})
$("#log-out").on('mouseout', function () {
  $(this).find('i').removeClass('fa-solid fa-door-open fa-lg').addClass('fa-solid fa-door-closed fa-xl')
})

//TODO Funciones de cerrar sesión
async function cerrar_sesionmsg() {
  mostrar_alert('warning', `¿Seguro que quieres salir?`, false, cerrar_sesion)
}

function cerrar_sesion() {
  sessionStorage.setItem('log', 'false')
  window.location.reload()
}

//TODO comprobando el rol del usuario que inició sesión
userRole = sessionStorage.getItem('rol') || 'user';

//* Accedemos a la sidebar.html y verificamos que pesatñas tiene acceso ese usuario
fetch('sidebar.html')
  .then(res => res.text())
  .then(html => {
    const container = document.getElementById('sidebar-container'); 
    container.innerHTML = html;

    //* Filtra elementos según el rol
    const items = container.querySelectorAll('[data-role]');
    items.forEach(item => {
      const allowedRoles = item.getAttribute('data-role').split(',');
      if (!allowedRoles.includes(userRole)) {
        item.remove(); 
      }
    });

    //* Activamos la opción del treeview en el sidebar
    $(function () {
      $('[data-widget="treeview"]').Treeview('init');
    });

    //* Añadimos el nombre del usuario en el sidebar
    let usuarioLog = JSON.parse(sessionStorage.getItem('user'))
    let user = document.getElementById('user')
    user.textContent = usuarioLog.resultado[0]

    //* Agregar clase 'active' a la opción del menú actual
    const currentPage = window.location.pathname.split('/').pop(); 
    const links = container.querySelectorAll('.nav-link');

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('active', 'bg-lightblue');


        let parent = link.closest('.nav-item');
        while (parent) {
          if (parent.classList.contains('nav-item')) {
            parent.classList.add('menu-open');
          }


          parent = parent.parentElement.closest('.nav-item');
        }

      } else {
        link.classList.remove('active', 'bg-lightblue');
      }
    });

  })
  .catch(err => console.error('Error al cargar sidebar:', err));


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
    icon: tipo, // 'success', 'error', 'warning', 'info', 'question'
    title: titulo,
    html: mensaje,
    timer: tiempo || 2500,
    timerProgressBar: true,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
    heightAuto: true,
  });
}


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
