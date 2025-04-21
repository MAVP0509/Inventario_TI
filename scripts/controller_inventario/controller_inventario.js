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

$(document).ready(function (){

    $('#tabla1').on('mouseover', '.icon', function() {
        $(this).find('i').addClass('fa-bounce');  // Agregar una clase extra si lo deseas
    }).on('mouseout', '.icon', function() {
        $(this).find('i').removeClass('fa-bounce');
    });
})
$(".icon").on('mouseover', function(){
    $(this).find('i').addClass("fa-bounce");
})
$(".icon").on('mouseout', function(e){
    $(this).find('i').removeClass("fa-bounce");
})
let toast = $('#liveToast')

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
                style: 'multi',
                selector: 'td:not(:first-child)'
            },
            rowCallback: function (row, data) {
                $(row).on('click', function() {
                    const checkbox = $(this).find('input[type="checkbox"]');
                    const isChecked = checkbox.prop('checked');
                    checkbox.prop('checked', !isChecked);
                    if (!isChecked) {
                        $(this).attr('style', 'background-color: #d1ecf1; color: #0c5460;');
                    } else {
                        $(this).removeAttr('style');
                    }
                    selecionar_registro(data.id);
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
                        let modal = new bootstrap.Modal(document.getElementById('modal-registro'));
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

let modal = ""

async function crear_registro(params) {
    
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
        fecha_entrega: $("inp-fecha-entrega").val()
    }

    let server = await server_inventario(model);
    let response = JSON.parse(respuesta);

    
        if (response.resultado === true) {
            mostrar_alerta('success', '¡Registro exitoso!', 'El registro se ha creado correctamente.');
            
        } else {
            mostrarAlerta('error', 'Error', 'No se pudo crear el registro. Inténtalo nuevamente.');
        }
    
    let table = $('#tabla1').DataTable();
    table.destroy();
    consultar_informacion();
    let modal = new bootstrap.getInstance(document.getElementById('modal-registro'));
    modal.hide();
}

async function editar_registro(params) {
    deshabilitar_campo();
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
            mostrarAlerta('error', 'Error', 'No se pudo eliminar el registro. Inténtalo nuevamente.');
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

function validar_numero(){
    let num_serie = /^[A-Z0-9]{10,20}$/

    if (num_serie) {

    }
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


  //TODO: Funciones para el resguardo
let modalRes  
function resguardo(){
    modalRes = new bootstrap.Modal(document.getElementById('mdl-res'));
    modalRes.show();
}

async function crear_resguardo(params) {
    let model = {
        accion : 6,
        usuario : $('#select-usu').find('option:selected').text()
    }
    /* let valor = $('#select-usu').val();
    let texto = $('#select-usu').find('option:selected').text();
    return { id: valor, nombre: texto };
    console.log(valor,texto) */
    let server = await server_inventario(model)

    if (server?.resultado?.length > 0) {
        // Enviar los datos al PHP del Excel para generar el archivo
        await descargar_excel({ datos: server.resultado });
    } else {
        alert("No se encontraron datos para generar el resguardo.");
    }

    modalRes.hide();
}

//*funcion de prueba de descarga del excel
/* function descargar_excel() {
    fetch('database/controller_excel/controller_excel.php')
        .then(response => {
            if (!response.ok) throw new Error('Error al generar el archivo');
            return response.blob();
        })
        .then(blob => {
            const nombreArchivo = 'Reporte_' + new Date().toISOString().slice(0, 10) + '.xlsx'; // Ejemplo: Reporte_2025-04-15.xlsx
            const url = window.URL.createObjectURL(blob);

            const enlace = document.createElement('a');
            enlace.href = url;
            enlace.download = nombreArchivo;
            document.body.appendChild(enlace);
            enlace.click();
            document.body.removeChild(enlace);
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ocurrió un error al generar el Excel.');
        });

    return false; // Para evitar que el enlace navegue
} */

async function descargar_excel(params) {
    const response = await fetch('database/controller_excel/controller_excel.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    });

    if (!response.ok) {
        alert('Error al generar el Excel');
        return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const nombreArchivo = 'Reporte_' + new Date().toISOString().slice(0, 10) + '.xlsx';

    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    window.URL.revokeObjectURL(url);
}