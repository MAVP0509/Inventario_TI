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
    //$('ul').Treeview(options)
    /* $(function () {
      $('[data-widget="treeview"]').Treeview('init');
      $('ul').Treeview(options)
    }); */
    /* $('[data-widget="treeview"]').each(function () {
      $.AdminLTE.Treeview._jQueryInterface.call($(this));
    });
 */
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

$(document).ready(function () {
  $('[data-widget="treeview"]').Treeview();
});

/* document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('sidebar-container');
  const usuario = JSON.parse(sessionStorage.getItem('user'));
  const rol = sessionStorage.getItem('rol') || 'guest'; // rol por defecto
  const nombre = usuario?.resultado?.[0] || 'Invitado';

  const menu = {
    admin: [
      { icon: 'fa-cubes', label: 'Inventario', link: 'inventario.html' },
      { icon: 'fa-clock-rotate-left', label: 'Histórico', link: 'historico.html' },
      { icon: 'fa-desktop', label: 'Activos de baja', link: 'bajas.html' },
      {
        icon: 'fa-gear',
        label: 'Configuración',
        submenu: [
          { icon: 'fa-users-rays', label: 'Supervisores', link: 'supervisores.html' },
          { icon: 'fa-users', label: 'Usuarios del sistema', link: 'usuario.html' },
          {
            icon: 'fa-warehouse',
            label: 'Inventario',
            submenu: [
              { icon: 'fa-computer', label: 'Rubro', link: 'conf_rubro.html' },
              { icon: 'fa-display', label: 'Tipos de dispositivos', link: 'conf_tipo.html' },
              { icon: 'fa-registered', label: 'Marca', link: 'conf_marca.html' },
              { icon: 'fa-users', label: 'Usuarios', link: 'conf_usuarios.html' },
            ]
          }
        ]
      }
    ],
    user: [
      { icon: 'fa-cubes', label: 'Inventario', link: 'inventario.html' }
    ],
    guest: []
  };

  const buildMenu = (items) => {
    let html = '';
    items.forEach(item => {
      if (item.submenu) {
        html += `
          <li class="nav-item has-treeview">
            <a href="#" class="nav-link">
              <i class="nav-icon fa-solid ${item.icon}"></i>
              <p>${item.label}<i class="right fa fa-angle-left"></i></p>
            </a>
            <ul class="nav nav-treeview">
              ${buildMenu(item.submenu)}
            </ul>
          </li>`;
      } else {
        html += `
          <li class="nav-item">
            <a href="${item.link}" class="nav-link">
              <i class="nav-icon fa-solid ${item.icon}"></i>
              <p>${item.label}</p>
            </a>
          </li>`;
      }
    });
    return html;
  };

  const sidebarHTML = `
    <div class="sidebar">
      <div class="user-panel mt-3 pb-3 mb-3 d-flex">
        <div class="image">
          <img src="images/user2.png" class="img-circle elevation-2" alt="User Image">
        </div>
        <div class="info">
          <a href="#" class="d-block">${nombre}</a>
        </div>
      </div>
      <nav class="mt-2">
        <ul class="nav nav-pills nav-sidebar flex-column nav-child-indent" data-widget="treeview" role="menu" data-accordion="false">
          ${buildMenu(menu[rol])}
        </ul>
      </nav>
    </div>
  `;

  container.innerHTML = sidebarHTML;

  // Inicializa treeview
  $('[data-widget="treeview"]').Treeview('init');

  // Marca como activa la opción actual
  const currentPage = window.location.pathname.split('/').pop();
  const links = container.querySelectorAll('.nav-link');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active', 'bg-lightblue');
      const parent = link.closest('.nav-item.has-treeview');
      if (parent) {
        parent.classList.add('menu-open');
        const toggle = parent.querySelector('.nav-link');
        if (toggle) toggle.classList.add('active');
      }
    }
  });
});
 */