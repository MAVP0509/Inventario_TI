
let respuesta
function server_usuario(model) {
    return new Promise ((resolve,reject)=>{
        $.ajax({
            type: "POST",
            url: "database/controller_usuario/controller_usuario.php",
            data: {
                trama:JSON.stringify(model) 
            },
            success: function(response){
                try {
                    resolve(JSON.parse(response))
                    respuesta=response
                    //console.log(response)
                } catch (error) {
                    reject(error)
                }
            }
        })
    })
}

function server_email(model){
    return new Promise ((resolve,reject)=>{
        $.ajax({
            type: "POST",
            url: "database/controller_email/controller_email.php",
            data: {
                trama:JSON.stringify(model)
            },
            success: function(response){
                Swal.close()
                respuesta = response
                try {
                    resolve(JSON.parse(response))
                    console.log(JSON.parse(response))   
                } catch (error) {
                    reject(error)
                }
            }
        })
    })
}


$(document).ready(function (){
    document.getElementById('fechanacReg').addEventListener('input',calcular_edadreg);
    document.getElementById('fechanac').addEventListener('input',calcular_edadedit);
    document.getElementById('ver-passReg').addEventListener('click', ver_contraseña);

    $('#tbl-usuario').on('mouseover', '.icon', function() {
        $(this).find('i').addClass('fa-bounce');  // Agregar una clase extra si lo deseas
    }).on('mouseout', '.icon', function() {
        $(this).find('i').removeClass('fa-bounce');
    });
})


let datos = []
let elemento
let table
let seleccionados = []
async function consultar_usuarios() {
    
    let server = await server_usuario({accion : 2})

    datos = server.resultado
        
    /* let table = $("#tbl-usuario").DataTable()
    table.destroy()

    $("#tbl-usuario").DataTable({
                data: usuarios, //? Este es el array de objetos que trae el ajax, en este caso es el array de usuarios.
    
                columns: [ //? Aqui se definen las columnas de la tabla, el primer elemento es el id de la columna, el segundo es el nombre de la columna y el tercero es el render, que es lo que se va a mostrar en la tabla.
                    {
                        data: 'id',
                        render: function (data, type, row) {
                            let control = `<div class="form-group form-check">
                                <input type="checkbox" class="form-check-input" 
                                onclick="seleccionar_usuarios(${data})" value="${data}" id="check${data}">
                            </div>`
                            return control;
                        }
                    },
                    {
                        data: 'id',
                        render: function (data, type, row, meta) {
                            let control = `<label style="text-align: center">${data}</label>`
                            return meta.row + 1;
                        }
                    },
                    {
                        data: 'nombre',
                        render: function (data, type, row) {
                            let control = `<label style="font-weight: normal; font-size: 12px;">${data ? data : "NA"}</label>`
                            return control;
                        }
                    },
                    {
                        data: "correo",
                        render: function (data, type, row) {
                            let control = `<label style="font-weight: normal; font-size: 12px;">${data ? data : "NA"}</label>`
                            return control;
                        }
    
                    },
                    {
                        data: 'edad',
                        render: function (data, type, row) {
                            let control = `<label style="font-weight: normal; font-size: 12px;">${data ? data : "NA"}</label>`
                            return control;
                        }
                    },
                    {
                        data: "telefono",
                        render: function (data, type, row) {
                            let control = `<label style="font-weight: normal; font-size: 12px;">${data ? data : "NA"}</label>`
                            return control;
                        }
    
                    },
                    {
                        data: 'fecha_nac',
                        render: function (data, type, row) {
                            let control = `<label style="font-weight: normal; font-size: 12px;">${data ? data : "NA"}</label>`
                            return control;
                        }
                    },
                    {
                        data: "fecha_reg",
                        render: function (data, type, row) {
                            let control = `<label style="font-weight: normal; font-size: 12px;">${data ? data : "NA"}</label>`
                            return control;
                        }
    
                    },
                    {
                        data: "id",
                        render: function (data, type, row) {
                            let control = `<div class="d-flex justify-content-center align-items-center">
                                <button type="button" style="text-align: center" class="btn btn-warning icon" id="${data}" value="${data}" onclick="seleccionar_usuario(this)">
                                    <i class="fa-solid fa-pen-to-square fa-lg"></i>
                                </button>
                            </div>`
                            return control;
                        }
                    }
                ], 
                dom: `
                    <'row mb-2'<'col-sm-6 text-left'f><'col-sm-6 text-right'B>>
                    <'row'<'col-sm-12 text-center'tr>>
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
                rowCallback: function (row, data){
                    $(row).on('click', function () {
                        if ($(event.target).closest('.btn-warning.icon').length > 0) {
                            return;
                        }

                        const checkbox = $(this).find('input[type="checkbox"]');
                        const ischecked = checkbox.prop('checked');

                        checkbox.prop('checked', !ischecked);
                        if (!ischecked) {
                            $(this).attr('style', 'background-color: #d1ecf1; color: #0c5460;');
                        } else {
                            $(this).removeAttr('style');
                        }
                        seleccionar_usuarios(data.id);
                    });
                },
                buttons:[
                    {
                        html: `<div>
                            <button type="button" onclick="nuevo_usuario()" class="btn btn-success icon"><i class="fa-solid fa-plus fa-lg"></i> Nuevo Usuario</button>
                        </div>`,
                    },
                    {
                        html: `<div>
                            <button type="button" onclick="mensaje_eliminar()" class="btn btn-danger icon" style="margin-left: 10px;">
                            <i class="fa-solid fa-trash-can fa-lg"></i> Eliminar Usuario</button>
                        </div>`,
                    },
                ],
                stateSave: true,
                responsive: true,
                //!Esta parte del codigo (DOM) es para que los botones, paginacion y filtros de busqueda se acomoden a sus necesidades, si quieren pueden buscar mas info en la documentacion de datatables, pero en este caso no es necesario.
  
    }) */   
    //* Idioma Español
    Tabulator.extendModule("localize", "langs", {
        "es": {
            "pagination": {
                "first": '<i class="fa-solid fa-angles-right fa-flip-horizontal"></i>',
                "first_title": "Primera página",
                "last": '<i class="fa-solid fa-angles-right"></i>',
                "last_title": "Última página",
                "prev": '<i class="fa-solid fa-angle-right fa-flip-horizontal"></i>',
                "prev_title": "Página anterior",
                "next": '<i class="fa-solid fa-angle-right"></i>',
                "next_title": "Página siguiente",
                "page_size": "Tamaño",

            },
            "headerFilters": {
                "default": "Filtrar columna...",
                "columns": {}
            },
            "groups": {
                "item": "ítem",
                "items": "ítems"
            },
            "ajax": {
                "loading": "Cargando...",
                "error": "Error al cargar datos"
            },
            "data": {
                "loading": "Cargando datos...",
                "error": "Error al cargar datos"
            }
        }
    });

    // Inicializar cada fila con "seleccionado: false"
    datos.forEach(d => d.seleccionado = false);

    // Formatter del ícono tipo checkbox
    let squareIcon = function (cell, formatterParams, onRendered) {
        const seleccionado = cell.getRow().getData().seleccionado;
        const iconClass = seleccionado ? "fa-solid fa-square-check" : "fa-regular fa-square";
        return `<button type='button' class='btn icon    toggle-select'>
                    <i class='${iconClass} fa-lg'></i>
                </button>`;
    };

    let editIcon = function (cell, formatterParams, onRendered) { //plain text value
        return "<button type='button' class='btn btn-warning icon' onclick=''><i class='fa-solid fa-pen-to-square fa-lg'></i></button>";
    };

    // Función para alternar selección y actualizar array
    function seleccionar_usuarios(params) {
        let index = seleccionados.indexOf(params);

        if (index === -1) {                  // ó retorna -1 si el elemento no esta presente.
            seleccionados.push(params); // Añade uno o más elementos al final de un array
        } else {
            seleccionados.splice(index, 1);
        }
        //console.log(seleccionados); // para depuración
    }
    table = new Tabulator('#tbl', {
        locale: "es",
        data: datos,
        layout: "fitColumns",              //fit columns to width of table
        pagination: true,               //paginate the data
        paginationSize: 10,                //allow 10 rows per page of data
        paginationSizeSelector: [5, 10, 15, 20],
        paginationCounter: function (pageSize, currentRowStart, currentRowEnd, currentPage) {
            const totalRows = table.getDataCount(); // Asegúrate que 'table' esté accesible
            const end = Math.min(currentRowStart + pageSize - 1, totalRows);
            return `Mostrando del ${currentRowStart} al ${end} de ${totalRows} registros`;
        },
        movableColumns: true,              //allow column order to be changed
        rowFormatter: function (row) {
            data = row.getData()
            if (data.seleccionado === true) {
                row.getElement().classList.add("bg-primary")
            } else if (data.seleccionado === false) {
                row.getElement().classList.remove("bg-primary")
            }
        },
        paginationButtonCount: 3,
        columns: [
            {
                formatter: squareIcon, width: 70, hozAlign: "center",
                cellClick: function (e, cell) {
                    // Alternar estado de seleccionado
                    let rowData = cell.getRow().getData();
                    rowData.seleccionado = !rowData.seleccionado;
                    cell.getRow().reformat();
                    seleccionar_usuarios(rowData.id)
                }, headerSort: false, frozen: true
            },
            { title: "ID", field: "id", width: 45, hozAlign: "center", headerSort: false },
            {
                title: "Nombre", field: "nombre", cellClick:
                    function (e, cell) {
                        let rowData = cell.getRow().getData()
                        rowData.seleccionado = !rowData.seleccionado
                        cell.getRow().reformat();
                        seleccionar_usuarios(rowData.id)
                    }
            },
            {
                title: "Correo", field: "correo", cellClick:
                    function (e, cell) {
                        let rowData = cell.getRow().getData()
                        rowData.seleccionado = !rowData.seleccionado
                        cell.getRow().reformat();
                        seleccionar_usuarios(rowData.id)
                    }
            },
            {
                title: "Edad", field: "edad", cellClick:
                    function (e, cell) {
                        let rowData = cell.getRow().getData()
                        rowData.seleccionado = !rowData.seleccionado
                        cell.getRow().reformat();
                        seleccionar_usuarios(rowData.id)
                    }
            },
            {
                title: "Teléfono", field: "telefono", cellClick:
                    function (e, cell) {
                        let rowData = cell.getRow().getData()
                        rowData.seleccionado = !rowData.seleccionado
                        cell.getRow().reformat();
                        seleccionar_usuarios(rowData.id)
                    }
            },
            {
                title: "Fecha de Nacimiento", field: "fecha_nac", cellClick:
                    function (e, cell) {
                        let rowData = cell.getRow().getData()
                        rowData.seleccionado = !rowData.seleccionado
                        cell.getRow().reformat();
                        seleccionar_usuarios(rowData.id)
                    }
            },{
                formatter: editIcon, width: 60, hozAlign: "center",
                cellClick: function (e, cell) {
                    elemento = cell.getRow().getData();
                    mdl_editar_usuario(elemento);
                },
                headerSort: false, frozen: true
            },
        ],
    })
}


let usuSelect = ""
let modalEdit 
async function mdl_editar_usuario(params) {

    for (let i = 0; i < datos.length; i++) {
        const element = datos[i];

        if(element.id===params.id){

            usuSelect = element;
            break;
        }
        
    }

    document.getElementById('nombre').value=usuSelect.nombre
    document.getElementById('correo').value=usuSelect.correo
    document.getElementById('telefono').value=usuSelect.telefono
    document.getElementById('fechanac').value=usuSelect.fecha_nac
    document.getElementById('edad').value=usuSelect.edad
    document.getElementById('fecha_reg').value=usuSelect.fecha_reg
    document.getElementById('contraseña').value=usuSelect.contraseña

    $("#modalEditar").modal('show')
}

async function editar_usuario(params) {
    let model = {
        accion : 1,
        id : usuSelect.id,
        nombre : $('#nombre').val().trim(),
        correo : $('#correo').val().trim(),
        telefono : $('#telefono').val().trim(),
        fecha_nac : $('#fechanac').val().trim(),
        edad : $('#edad').val().trim(),
        fecha_reg : $('#fecha_reg').val().trim(),
        contraseña : $('#contraseña').val().trim()
    }

    let server = await server_usuario(model)

    if(server.resultado === true){
        mostrar_toast('success', 'Inventario TI', 'Usuario editado')
    }else if(server.resultado === false){
        mostrar_toast('error', 'Inventario TI', 'Error en la consulta')
    } 

    consultar_usuarios()
    
    $("#modalEditar").modal('hide')
}


async function mensaje_eliminar() {

    if (seleccionados.length === 0) {
        mostrar_toast('warning', 'Inventario TI', 'Por favor, selecciona al menos un usuario para continuar')
        
    }else{
        mostrar_alert('warning', `¿Está seguro de eliminar ${seleccionados.length} usuario(s)?`, false, eliminar_usuario);
        /* modalElim = new bootstrap.Modal(document.getElementById('modalElim'))
        modalElim.show() */
    }
}

async function eliminar_usuario(params) {
        let model = {
            accion : 3,
            id : seleccionados
        }

        let response = await server_usuario(model);
        
        if (response.resultado) {
            mostrar_toast('success', 'Inventario TI', 'Usuario(s) eliminado(s) correctamente')

            consultar_usuarios();
        } else {
            mostrar_toast('error', 'Inventario TI', 'Error en la consulta');
        }
        deseleccionar_todos()
        
}

function deseleccionar_todos() {
    //  Resetear propiedad "seleccionado"
    datos.forEach(d => d.seleccionado = false);

    //  Limpiar el array de seleccionados
    seleccionados = [];

    //  Forzar re-renderizado de todas las filas para reflejar los íconos
    table.getRows().forEach(row => row.reformat());
}


async function mdl_nuevo_usuario(params) {
    let inputs = document.getElementsByName('insertMdl')
        for (let i = 0; i < inputs.length; i++) {
            const element = inputs[i].value = "";
        }
    
    $("#modalInsertar").modal('show')
}

async function insertar_usuario(params) {


    const validacion = [
        "nombreReg",
        "correoReg",
        "telefonoReg", 
        "fechanacReg",
        "contraseñaReg",
    ];

    // Validar campos
    if (!validar_campos(validacion)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente');
        return;
    }
    
        let model = {
        accion : 0,
        nombre : $('#nombreReg').val().trim(),
        correo : $('#correoReg').val().trim(),
        telefono : $('#telefonoReg').val().trim(),
        fecha_nac : $('#fechanacReg').val().trim(),
        edad : $('#edadReg').val().trim(),
        contraseña : $('#contraseña').val().trim()
        }

        let server = await server_usuario(model)

        if(server.resultado === true){
            mostrar_toast('success', 'Inventario TI', 'Usuario registrado correctamente')
        }else if(server.resultado === false){
            mostrar_toast('warning', 'Inventario TI', 'El correo ya está registrado')
            return;
        } 
    
        consultar_usuarios()
        $("#modalInsertar").modal('hide')
}


function calcular_edadreg(){
    let fechaNacimiento = new Date(document.getElementById('fechanacReg').value);
    let hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    
    let mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }

    document.getElementById('edadReg').value = edad;
}

function calcular_edadedit(){
    let fechaNacimiento = new Date(document.getElementById('fechanac').value);
    let hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    
    let mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }

    document.getElementById('edad').value = edad;
}

function ver_contraseña(){
    let regPasswordInput = document.getElementById('contraseñaReg')
    let iconReg = document.getElementById('ver-passReg')    

    if (regPasswordInput.type === 'password') {
        regPasswordInput.type = 'text';
        iconReg.classList.remove('fa-eye-slash');  
        iconReg.classList.add('fa-eye');
    } else if(regPasswordInput.type === 'text'){
        regPasswordInput.type = 'password';
        iconReg.classList.remove('fa-eye');
        iconReg.classList.add('fa-eye-slash');
    }
}


let usuDes
async function desactivar_usuariomsg(params) {
    for (let i = 0; i < datos.length; i++) {
        const element = datos[i];

        if(element.id===params.value){
            usuDes = element;
            break;
        }
        
    }
    mostrar_alert('warning', '¿Está seguro de eliminar este usuario?', false ,desactivar_usuario)
}

async function desactivar_usuario(params) {
    let model ={
        accion : 3,
        id : usuDes.id
    }
    
    let r = await server_usuario(model)

    if (r.resultado) {
        mostrar_toast('success', 'Inventario TI', 'Usuario eliminado')
        let table = $("#tbl-usuario").DataTable()
        table.destroy()
        consultar_usuarios()
        
    } else {
        mostrar_toast('error', 'Inventario TI', 'Error en la consulta')
    }
}




// *Función para comprobar el nombre en el modal de registrar usuario
let nombre= false
$('#nombreReg').on('input', function(e) {
    //validar_nombre(e.currentTarget.value)
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚüÜ\s]{3,}$/
    if(!regexNombre.test(e.currentTarget.value)){
        document.getElementById('error-mensajeNombre').style = 'display : block; color:red;'
        nombre=false
    }else{
        document.getElementById('error-mensajeNombre').style = ' display : none;'
        nombre=true
    }
    
}); 


//*Función para comprobar el correo en el modal de registrar usuario
let email=false
$('#correoReg').on('input',function(e){
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if(!regexEmail.test(e.currentTarget.value)){
        document.getElementById('error-mensajeEmail').style = 'display : block; color:red;'
        email=false
    }else{
        document.getElementById('error-mensajeEmail').style = ' display : none;'
        email=true
    }
}
)

let tel= false
$('#telefonoReg').on('input', function() {
    this.value= this.value.replace(/[^0-9]/g, '')
    valTel = $(this).val();
    if (valTel.length < 10 ||valTel.length === 0) {
        document.getElementById('error-mensageTel').style = "display : block; color:red;"
        tel=false
    } else {
        document.getElementById('error-mensageTel').style = "display : none;"
        tel=true
    }
});


//* Función para comprobar la fecha de nacimiento en el modal de registrar usuario
let fecha= false
$('#fechanacReg').on('input', function(e) {
    //validar_nombre(e.currentTarget.value)
    const regexFecha = /^\d{4}-\d{2}-\d{2}$/
    if(!regexFecha.test(e.currentTarget.value)){
        document.getElementById('error-mensageFecha').style = 'display : block; color:red;'
        fecha=false
    }else{
        document.getElementById('error-mensageFecha').style = ' display : none;'
        fecha=true
    }
    
});


let pass= false
$('#contraseñaReg').on('input', function(e) {
    //validar_nombre(e.currentTarget.value)
    const regexPass = /^(?!\s*$).{2,}$/
    if(!regexPass.test(e.currentTarget.value)){
        document.getElementById('error-mensagePass').style = 'display : block; color:red;'
        pass=false
    }else{
        document.getElementById('error-mensagePass').style = ' display : none;'
        pass=true
    }
    
});



async function recuperar_contraseña() {
    let model ={
        accion : 0,
        correo : $("#correo").val().trim(),
        dominio : window.location.hostname,
        puerto : location.port
    }
    
    let response = await server_email(model);
    
    if(response.resultado === true) {
        mostrar_toast('success', 'Correo Enviado', 'Se enviado un correo al usuario para recuperar su contraseña')
        console.log(window.location.hostname);
    } else {
        mostrar_toast('error', 'Error', 'No se envio el correo al usuario')
    }
    
}



function crear_word() {
    const enlace = document.createElement('a');
    enlace.href = 'database/controller_word2/controller_word2.php'; // ← cambia esto
    enlace.download = 'Pruebas.docx'; // nombre sugerido
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);

}



function mostrar_toast(tipo, titulo, mensaje) {
    Swal.fire({
        icon: tipo, // 'success', 'error', 'warning', 'info', 'question'
        title: titulo,
        text: mensaje,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        heightAuto : true,
    });
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

function mostrar_toast_cargando() {
    Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        showCloseButton: false,
        timer: undefined, // No cerrar automáticamente
        allowOutsideClick: false,
        background: '#fff',
        html: `
            <div style="display: flex; align-items: center;">
                <i class="fas fa-spinner fa-spin fa-lg" style="margin-right: 10px; color: #007bff;"></i>
                <span style="font-weight: 500;">Cargando...</span>
            </div>
        `,
        didOpen: () => {
            //Swal.showLoading(); // Esto muestra el spinner
        }
    });
}

// TODO: seleciona usuarios por id
let select = [];

async function selecionar_registro(params) {

    let index = select.indexOf(params); // Retorna el primer índice en el que se puede encontrar un elemento dado en el array,
    if (index === -1) {                  // ó retorna -1 si el elemento no esta presente.
        select.push(params); // Añade uno o más elementos al final de un array
    } else {
        select.splice(index, 1); 
    } 
}

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
            campo.classList.remove  ('is-invalid'); // Remueve la clase si el campo es válido
        }

        campo.addEventListener('input', function () {
            if (campo.value.trim()) {
                campo.classList.remove('is-invalid');
            }
        });
    });

    return valido;
}



