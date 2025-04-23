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


async function cerrar_sesionmsg() {
    mostrar_alert('warning', `¿Seguro que quieres salir?`, false , cerrar_sesion)
}

function cerrar_sesion(){
    sessionStorage.setItem('log','false')
    window.location.reload()
}


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