// Verificamos si el usuario está autenticado
if (sessionStorage.getItem('log') !== 'true') {
    // Si no está autenticado, redirigimos a login.html
        window.location.href = 'login.html';
}  


//TODO animando iconos 
$(".icon").on('mouseover', function(){
    $(this).find('i').addClass("fa-bounce");
})
$(".icon").on('mouseout', function(e){
    $(this).find('i').removeClass("fa-bounce");
})

//TODO Animando icono de salir
$("#log-out").on('mouseover', function(){
    $(this).find('i').removeClass('fa-solid fa-door-closed fa-lg').addClass('fa-solid fa-door-open fa-xl');
})
$("#log-out").on('mouseout', function(){
    $(this).find('i').removeClass('fa-solid fa-door-open fa-lg').addClass('fa-solid fa-door-closed fa-xl')
})


$(document).on('mouseover', '.icon', function() {
    $(this).find('i').addClass('fa-bounce');
}).on('mouseout', '.icon', function() {
    $(this).find('i').removeClass('fa-bounce');
});


async function cerrar_sesionmsg() {
    mostrar_alert('warning', `¿Seguro que quieres salir?`, false , cerrar_sesion)
}

function cerrar_sesion(){
    sessionStorage.setItem('log','false')
    window.location.reload()
}


userRole = sessionStorage.getItem('rol') || 'user';

fetch('sidebar.html')
  .then(res => res.text())
  .then(html => {
    const container = document.getElementById('sidebar-container');
    container.innerHTML = html;

    // Filtra elementos según el rol
    const items = container.querySelectorAll('[data-role]');
    items.forEach(item => {
      const allowedRoles = item.getAttribute('data-role').split(',');
      if (!allowedRoles.includes(userRole)) {
        item.remove(); // o item.style.display = 'none';
      }
    });

    $(function () {
      $('[data-widget="treeview"]').Treeview('init');
    });
    let usuarioLog = JSON.parse(sessionStorage.getItem('user'))
    let user = document.getElementById('user')
    user.textContent = usuarioLog.resultado[0] 

     // ✅ Agregar clase 'active' a la opción del menú actual
    const currentPage = window.location.pathname.split('/').pop(); // Ej: 'usuario.html'
    const links = container.querySelectorAll('.nav-link');

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('active', 'bg-lightblue');
    
        // Si es un submenú, abrir el padre
        const treeviewMenu = link.closest('.nav-treeview');
        if (treeviewMenu) {
          const parentLi = treeviewMenu.closest('.nav-item');
          parentLi.classList.add('menu-open');
    
          /* const parentLink = parentLi.querySelector('.nav-link');
          parentLink.classList.add('active'); */
        }
    
      } else {
        link.classList.remove('active', 'bg-lightblue');
      }
    });

  })
  .catch(err => console.error('Error al cargar sidebar:', err));


function mostrar_alert(tipo, mensaje, skip, funcion) {
    Swal.fire({
        title: 'Inventario TI',
        text: mensaje,
        icon: tipo, // 'success', 'error', 'warning', 'info', 'question'
        showCancelButton: true,
        confirmButtonColor: '#0000FF',
        allowOutsideClick : skip, // true, false
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