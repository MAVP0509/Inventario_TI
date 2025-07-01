//* Verificamos si el usuario está autenticado
if (sessionStorage.getItem('log') !== 'true') {
  //* Si no está autenticado, redirigimos a login.html
  window.location.href = 'login.html';
}

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



