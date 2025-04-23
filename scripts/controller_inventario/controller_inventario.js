let respuesta

function server_inventario(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_inventario/controller_inventario.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function(response) {
                try {
                    resolve(JSON.parse(response))
                    //console.log(resolve(JSON.parse(response)))
                    respuesta = response
                } catch (error) {
                    reject(error)
                }
            }
        })
    });


}

function server_excel(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_excel/controller_excel.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function(response) {
                try {
                    resolve(JSON.parse(response))
                    //console.log(resolve(JSON.parse(response)))
                    respuesta = response
                } catch (error) {
                    reject(error)
                }
            }
        })
    });


}

window.addEventListener('load', function () {
    // Leemos el mensaje del registro desde localStorage
    const mensajeRegistro = sessionStorage.getItem('bienvenido');
    
    if (mensajeRegistro) {
        // Si el mensaje existe, mostramos el toast
        mostrar_alerta('success', 'Bienvenido', mensajeRegistro);



        // Eliminamos el mensaje para evitar que aparezca nuevamente
        sessionStorage.removeItem('bienvenido');
    }
})

$(document).ready(function (){

    $('#tabla1').on('mouseover', '.icon', function() {
        $(this).find('i').addClass('fa-bounce');  // Agregar una clase extra si lo deseas
    }).on('mouseout', '.icon', function() {
        $(this).find('i').removeClass('fa-bounce');
    });
})

let datos = [];

async function consultar_informacion(params) {

    let model = {
        accion: 2
    };
    

    let response = await server_inventario(model);
    //console.log(response);
    datos = response.resultado;

    let table = $('#tabla1').DataTable();
    table.destroy();
        
    try {
        $("#tabla1").DataTable({
            data: datos,
            columns: [
                {
                    data: "id",
                    render: function(data, type, row) {
                        let control = `<div class="form-group form-check">
                            <input type="checkbox" class="form-check-input"
                            onclick="selecionar_registro(${data})" value="${data}" id="check${data}">
                        </div>`
                        return control;
                    }
                },
                {
                    data: "id",
                    render: function(data, type, row, meta) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return meta.row + 1;
                    }
                },
                {
                    data: "zona",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "rubro",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "af",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "tipo",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "marca",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "modelo",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "num_serie",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "ubicacion",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "tag",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "usuario",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "posicion",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "fecha_entrega",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "id",
                    render: function(data, type, row) {
                        let control = `<div class="d-flex justify-content-center align-items-center">
                                        <button type="button" style="text-align: center" class="btn btn-warning icon" id="${data}" value="${data}" onclick="mostrar_registro(this)">
                                        <i class="fa-solid fa-pen-to-square fa-lg"></i></button></div>`
                                        return control;
                    }
                }
            ],
            dom: `
                <'row mb-2'<'col-sm-6 text-left'f><'col-sm-6 text-right'B>>
                <'row'<'col-sm-12'tr>>
                <'row mt-2'<'col-sm-3'l><'col-sm-5 text-center'i><'col-sm-4 text-right'p>>
            `,
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json',
                paginate: {
                    first: '<i class="fas fa-angle-double-left"></i>',
                    previous: '<i class="fas fa-angle-left"></i>',
                    next: '<i class="fas fa-angle-right"></i>',
                    last: '<i class="fas fa-angle-double-right"></i>'
                },
            },
            select: {
                style: 'multi', // Permite selecionar múltiples filas
                selector: 'td:not(:first-child)' // Evita selecionar al hacer click en el checkbox (opcional)
            },
            rowCallback: function (row, data) {
                $(row).on('click', function() {
                    const checkbox = $(this).find('input[type="checkbox"]');
                    const isChecked = checkbox.prop('checked');
                    
                    checkbox.prop('checked', !isChecked); // Alterna el estado del checkbox
                    // Muestra la selección
                    if (!isChecked) {
                        $(this).attr('style', 'background-color: #d1ecf1; color: #0c5460;'); // Estilo para seleccionado
                    } else {
                        $(this).removeAttr('style'); // Deselecionar
                    }
                    selecionar_registro(data.id); // Llama a la función para manejar la selección
                });
            },
            buttons: [
                /* {
                    extend: 'excelHtml5',
                    text: 'Exportar a Excel',
                    className: 'btn btn-sm btn-success'
                },
                {
                    extend: 'pdfHtml5',
                    text: 'Exportar a PDF',
                    className: 'btn btn-sm btn-danger'
                },
                {
                    extend: 'print',
                    text: 'Imprimir',
                    className: 'btn btn-sm btn-primary'
                }, */
                {
                    text: '<i class="fa-solid fa-pen-to-square fa-lg"></i> Crear registro',
                    className: 'btn btn-success icon',
                    attr: {
                        title: 'Haz clic para agregar un registros'
                    },
                    action: function (e, dt, node, config) {
                        modal = new bootstrap.Modal(document.getElementById('modal-registro'));
                        modal.show();
                        //mostrar_datos()
                    }
                },
                {
                    text: '<i class="fa-solid fa-trash fa-lg"></i> Eliminar registro',
                    className: 'btn btn-danger icon',
                    attr: {
                        title: 'Haz clic para eliminar un registro'
                    },
                    action: function (e, dt, node, config) {
                        confirmar_eliminacion();
                    }
                },
                
            ],
            stateSave: true,
            resposive: true,
           
        });
        
    } catch (error) {
        console.log(error)
    }



}

let ususelect = [];
/* async function mostrar_datos(params) {

    let zona = "Base operativa región Sur";
    let registro = dayjs().format('YYYY-MM-DD HH:mm:ss');//new Date().toISOString().slice(0, 19).replace('T', ' ');

    $("#inp-zona").val(zona);
    $("#inp-fecha-entrega").val(registro);

    let modal = new bootstrap.Modal(document.getElementById('modal-registro'));
    modal.show();
} */

let selecreg ="";
let modalE

async function mostrar_registro(params) {
    for (let i = 0; i < datos.length; i++) {
        const element = datos[i];

        if(element.id===params.value){
            selecreg = element;
            break;
        }
    }
        document.getElementById("edi-zona").value = selecreg.zona;
        document.getElementById("edi-rubro").value = selecreg.rubro;
        document.getElementById("edi-af").value = selecreg.af;
        document.getElementById("edi-tipo").value = selecreg.tipo;
        document.getElementById("edi-marca").value = selecreg.marca;
        document.getElementById("edi-modelo").value = selecreg.modelo;
        document.getElementById("edi-num-serie").value = selecreg.num_serie;
        document.getElementById("edi-ubicacion").value = selecreg.ubicacion;
        document.getElementById("edi-tag").value = selecreg.tag;
        document.getElementById("edi-usuario").value = selecreg.usuario;
        document.getElementById("edi-posicion").value = selecreg.posicion;
        document.getElementById("edi-fecha-entrega").value = selecreg.fecha_entrega;

        modalE = new bootstrap.Modal(document.getElementById('modal-editar'));
        modalE.show();
        console.log(selecreg)
}

selecreg = [];

async function selecionar_registro(params) {

    let index = selecreg.indexOf(params); // Retorna el primer índice en el que se puede encontrar un elemento dado en el array,
    if (index === -1) {                  // ó retorna -1 si el elemento no esta presente.
        selecreg.push(params); // Añade uno o más elementos al final de un array
    } else {
        selecreg.splice(index, 1); 
    } 
}

let modal

async function crear_registro() {
    // Campos requeridos para validación
    const validacion = [
        "inp-zona",
        "inp-rubro",
        "inp-tipo",
        "inp-ubicacion",
    ];

    // Validar campos
    if (!validar_campos(validacion)) {
        mostrar_alerta('error', 'Error', 'Rellena los campos. Inténtelo nuevamente');
        return;
    }

    // Crear el modelo con los datos del formulario
    let model = {
        accion: 0,
        zona: $("#inp-zona").val().trim(),
        rubro: $("#inp-rubro").val().trim(),
        af: $("#inp-af").val().trim(),
        tipo: $("#inp-tipo").val().trim(),
        marca: $("#inp-marca").val().trim(),
        modelo: $("#inp-modelo").val().trim(),
        num_serie: $("#inp-num-serie").val().trim().toUpperCase(),
        ubicacion: $("#inp-ubicacion").val().trim(),
        tag: $("#inp-tag").val().trim(),
        usuario: $("#inp-usuario").val().trim(),
        posicion: $("#inp-posicion").val().trim(),
        fecha_entrega: $("#inp-fecha-entrega").val()
    };

    // Enviar datos al servidor
    let respuesta = await server_inventario(model);

    // Validar respuesta del servidor
    const serie = document.getElementById('inp-num-serie');
    serie.classList.remove('is-invalid'); // Remover clase de error si existía

    if (respuesta.resultado === true) {
        let table = $('#tabla1').DataTable();
        table.destroy();
        consultar_informacion();
        modal.hide();
        mostrar_alerta('success', '¡Registro exitoso!', 'El registro se ha creado correctamente.');
    } else if (respuesta.resultado === false) {
        if (respuesta.mensaje === "Número de serie duplicado") {
            serie.classList.add('is-invalid'); // Marcar el campo como inválido si hay un número de serie duplicado
            mostrar_alerta('warning', 'Número de serie duplicado', 'Este número de serie ya está registrado.');
        } else {
            mostrar_alerta('error', 'Error', 'No se pudo crear el registro. Inténtalo nuevamente.');
        }
    } else {
        mostrar_alerta('error', 'Error', 'No se pudo crear el registro. Inténtalo nuevamente.');
    }

}

async function editar_registro(params) {
    deshabilitar_campo();
    const validacion = [
        "inp-zona",
        "inp-rubro",
        "inp-tipo",
        "inp-ubicacion",
    ];
    let model = {
        accion: 1,
        id: selecreg.id,
        zona: $("#edi-zona").val().trim(),
        rubro: $("#edi-rubro").val().trim(),
        af: $("#edi-af").val().trim(),
        tipo: $("#edi-tipo").val().trim(),
        marca: $("#edi-marca").val().trim(),
        modelo: $("#edi-modelo").val().trim(),
        num_serie: $("#edi-num-serie").val().trim().toUpperCase(),
        ubicacion: $("#edi-ubicacion").val().trim(),
        tag: $("#edi-tag").val().trim(),
        usuario: $("#edi-usuario").val().trim(),
        posicion: $("#edi-posicion").val().trim(),
        fecha_entrega: $("#edi-fecha-entrega").val()
    }

    let server = await server_inventario(model);
    let response = JSON.parse(respuesta);


    if (response.resultado === true) {
        mostrar_alerta('success', '¡Edición exitosa!', 'El registro se ha actualizado correctamente.');
        
    } else {
        mostrar_alerta('error', 'Error', 'No se pudo editar el registro. Inténtalo nuevamente.');
    }

        consultar_informacion();
        modalE.hide();
    
}

async function desactivar_registro(params) {
    let response = await server_inventario({ accion: 3, id: selecreg });
        if (response.resultado === true) {
            mostrar_alerta('success', '¡Eliminación exitosa!', 'El registro se ha eliminado correctamente.');

            let table = $('#tabla1').DataTable();
            table.destroy();
            consultar_informacion();

        } else {
            mostrar_alerta('error', 'Error', 'No se pudo eliminar el registro. Inténtalo nuevamente.');
        }
}

/* async function eliminar_registro(params) {
    let response = await server_inventario({ accion: 4, id: id });
        if (response.resultado === true) {
            mostrar_alerta('success', '¡Eliminación exitosa!', 'El registro se ha eliminado correctamente.');
            $('#tabla1').DataTable().ajax.reload(); // Recargar la tabla
            $('#modal-registro').modal('hide');
        } else {
            mostrarAlerta('error', 'Error', 'No se pudo eliminar el registro. Inténtalo nuevamente.');
        }
} */

        //TODO: Validación de funciones

async function confirmar_eliminacion() {
    if (selecreg.length === 0) {
        mostrar_alerta('error', 'Error', 'Seleccione al menos un usuario. Inténtalo nuevamente.');
    } else {
        Swal.fire({
            title: '¿Está seguro de eliminarlo?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                desactivar_registro(); // Llama a la función para eliminar el registro
            }
        });
    }
}

function deshabilitar_campo(){
    // Al cambiar la opción en el select, bloqueamos o habilitamos el campo
    $("#edi-rubro").on('change', function() {
        if ($(this).val() !== "") {  // Si el valor no está vacío
            $(this).prop('disabled', true);  // Bloquear el campo select
        } else {
            $(this).prop('disabled', false);  // Habilitar el campo si no tiene valor
        }
    });

    // Verifica si el campo #edi-rubro ya tiene un valor
    if ($("#edi-rubro").val() !== "") {
        // Si tiene un valor, deshabilitar el campo
        $("#edi-rubro").prop('disabled', false);
    } else {
        // Si no tiene un valor, habilitar el campo
        $("#edi-rubro").prop('disabled', true);
    }
}

$(document).ready(function() {
    deshabilitar_campo();  // Llamamos a la función para asegurar que el campo se habilite/deshabilite al cargar
});

function validar_campos(campos) {
    let valido = true;

    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (!campo) {
            valido = false;
            return;
        }

        if (!campo.value.trim()) {
            campo.classList.add('is-invalid'); // Agrega la clase de advertencia
            valido = false;
        } else {
            campo.classList.remove('is-invalid'); // Remueve la clase si el campo es válido
        }

        campo.addEventListener('input', function () {
            if (campo.value.trim()) {
                campo.classList.remove('is-invalid');
            }
        });
    });

    return valido;
}

//TODO: Alertas, confirmaciones

function mostrar_alerta(tipo, titulo, mensaje) {
    Swal.fire({
        icon: tipo, // 'success', 'error', 'warning', 'info', 'question'
        title: titulo,
        text: mensaje,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
    });
}

//TODO: Configuración del select2
/* $(document).ready(function() {
    $(".select").select2({
        theme: 'bootstrap4',
        placeholder: "Selecciona un rubro", // Texto de ayuda
        allowClear: true, // Permitir limpiar la selección
        tags: true,
        dropdownParent: $(parentID) // * Permite al menú despegable se adjunte al modal
    });
  }); */

  $(document).ready(function() {
    $(".select").each(function() { //recorre cada <select class="select">
      const $select = $(this);
  
      // Encuentra el modal contenedor más cercano
      const $modal = $select.closest('.modal'); //
  
      $select.select2({
        theme: 'bootstrap4',
        placeholder: "Selecciona un rubro",
        allowClear: true,
        tags: true,
        dropdownParent: $modal.length ? $modal : $(document.body) // por si no está en modal
      });
    });
  });
  
  //*SELECT2 para hacer el resguardo
  $(document).ready(function () {
    fetch('database/controller_inventario/controller_inventario.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'trama=' + encodeURIComponent(JSON.stringify({ accion: 5 }))
    })
    .then(response => response.json())
    .then(data => {
      const opciones = data.resultado.map(item => ({
        id: item.usuario || '',
        text: item.usuario || ''
      }));
  
      // Agrega opción vacía al principio
    $('#select-usu').empty().append(new Option('', '', false, false));

      $('#select-usu').select2({
        theme: 'bootstrap4',
        allowClear: true,
        placeholder: 'Selecciona un usuario',
        dropdownParent: $('#mdl-res'),
        data: opciones
      });
    })

    // Esto asegura que no haya valor seleccionado por default
    $('#select-usu').val(null).trigger('change');

    /* .catch(error => {
      console.error('Error cargando usuarios:', error);
    }); */
  });

  $(document).ready(function () {
    fetch('database/controller_inventario/controller_inventario.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'trama=' + encodeURIComponent(JSON.stringify({ accion: 7 }))
    })
    .then(response => response.json())
    .then(data => {
      const opciones = data.resultado.map(item => ({
        id: item.rubro || '',
        text: item.rubro || ''
      }));
  
      // Agrega opción vacía al principio
    $('#inp-rubro').empty().append(new Option('', '', false, false));

      $('#inp-rubro').select2({
        theme: 'bootstrap4',
        allowClear: true,
        placeholder: 'Selecciona un rubro',
        dropdownParent: $('#modal-registro'),
        data: opciones
      });
    })

    // Esto asegura que no haya valor seleccionado por default
    $('#inp-rubro').val(null).trigger('change');

    /* .catch(error => {
      console.error('Error cargando usuarios:', error);
    }); */
  });

  $(document).ready(function () {
    fetch('database/controller_inventario/controller_inventario.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'trama=' + encodeURIComponent(JSON.stringify({ accion: 8 }))
    })
    .then(response => response.json())
    .then(data => {
      const opciones = data.resultado.map(item => ({
        id: item.tipo || '',
        text: item.tipo || ''
      }));
  
      // Agrega opción vacía al principio
    $('#inp-tipo').empty().append(new Option('', '', false, false));

      $('#inp-tipo').select2({
        theme: 'bootstrap4',
        allowClear: true,
        placeholder: 'Selecciona un tipo',
        dropdownParent: $('#modal-registro'),
        data: opciones
      });
    })

    // Esto asegura que no haya valor seleccionado por default
    $('#inp-tipo').val(null).trigger('change');

    /* .catch(error => {
      console.error('Error cargando usuarios:', error);
    }); */
  });

  //TODO: Funciones para el resguardo
let modalRes 
function resguardo(){
    let inputs = document.getElementsByName('resg-inpt')
    for (let i = 0; i < inputs.length; i++) {
        const element = inputs[i].value = "";
    }
    $('#select-usu').val(null).trigger('change');

    $(document).ready(function() {
        let hoy = new Date().toISOString().split('T')[0];
        $('#fecha-resguardo').val(hoy);
    });
  
    modalRes = new bootstrap.Modal(document.getElementById('mdl-res'));
    modalRes.show();
}

let infoResguardo
async function crear_resguardo(params) {

    let select = document.getElementById('select-usu')
    if (select.value === "") {
        mostrar_alerta('error', 'Error', 'Seleccione al menos un usuario. Inténtalo nuevamente.')
        return
    }
    let model = {
        accion : 6,
        usuario : $('#select-usu').find('option:selected').text(),
        comentario : $('#txt-area').val().trim(),
        fecha: $('#fecha-resguardo').val()
    }
    let server = await server_inventario(model)

    
    infoResguardo = server.resultado
    //console.log(infoResguardo)
    mostrar_alerta('warning', 'Inventario TI', 'Espere un momento');
    modalRes.hide();
    descargar_excel()
}


async function descargar_excel(params) {

    let model = {
        accion : 0,
        datos: infoResguardo
    }
    let server = await server_excel(model)

    let ruta = JSON.parse(respuesta)
    // Elimina comillas si vienen así: '"C:\\ruta\\archivo.xlsx"'
    ruta.resultado = ruta.resultado.replace(/^"|"$/g, '');

    // Reemplaza las \ por /
    ruta.resultado = ruta.resultado.replace(/\\/g, '/');

    // Cambia la extensión
    ruta.resultado = ruta.resultado.replace(/\.xlsx$/i, '.pdf');

    ruta.resultado = ruta.resultado.replace("C:/xampp/htdocs", "http://localhost")
    console.log(ruta.resultado)
    window.open(ruta.resultado, '_blank');
}

