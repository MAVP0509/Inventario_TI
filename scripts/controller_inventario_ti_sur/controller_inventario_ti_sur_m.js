let respuesta
function server_inventario(model) {
    return new Promise ((resolve,reject)=>{
        $.ajax({
            type: "POST",
            url: "database/controller_inventario_ti_sur_m/inventario_ti_sur_m.php",
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

async function consultar_inventario() {
    let model = {
        accion : 2
    }

    let Task = new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_inventario_ti_sur_m/inventario_ti_sur_m.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (response) {
                try {
                    resolve(JSON.parse(response))
                } catch (error) {
                    reject(error)
                }
            }
        });
    });

    Promise.all([Task]).then((respuesta) => {
        let inventario = respuesta[0].resultado
        /**
         * !A partir de aqui es donde se dibuja la tabla, primero se destruye la tabla si existe, y luego se vuelve a crear con los datos que trae el ajax.
         * !Recuerda que el id de la tabla es "tableUsuarios", si cambias el id de la tabla, cambia aqui tambien.
         */
        try {
            let table = $("#tbl-inventario").DataTable()
            table.destroy()
        } catch (error) {

        }

        dibujar_tabla(inventario)
    })
}

async function dibujar_tabla(params) {
    try {
        $("#tbl-inventario").DataTable({
            data: params, //? Este es el array de objetos que trae el ajax, en este caso es el array de usuarios.

            columns: [ //? Aqui se definen las columnas de la tabla, el primer elemento es el id de la columna, el segundo es el nombre de la columna y el tercero es el render, que es lo que se va a mostrar en la tabla.
                {
                    data: 'id_user_diavaz_all',
                    render: function (data, type, row) {
                        let control = `<label style="text-align: center">${row.Nombre + " " + row.Apellido_P + " " + row.Apellido_M}</label>`
                        return control;
                    }
                },
                {
                    data: "Correo_Diavaz",
                    render: function (data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }

                },
                {
                    data: "Rol",
                    render: function (data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "id_user_diavaz_all",
                    render: function (data, type, row) {
                        let control = `<button class="btn btn-primary btn-sm" value = '${JSON.stringify(row)}' onClick='EditarUsuario(this)' ><i class="fa fa-edit"></i></button>`;
                        return control;
                    }
                },
                {
                    data: "Activo",
                    render: function (data, type, row) {
                        let enabled = ''
                        if (data == 1) {
                            enabled = "checked"
                        }
                        else {
                            enabled = ""
                        }
                        let control = `<div class="custom-control custom-switch custom-switch-off-danger custom-switch-on-success">
                        <input type="checkbox" class="custom-control-input" id="customSwitch_${row.id_user_diavaz_all}"  ${enabled}>
                        <label class="custom-control-label" for="customSwitch_${row.id_user_diavaz_all}"></label>
                        </div>`
                        return control;
                    }
                },
            ], stateSave: true,
            //!Esta parte del codigo (DOM) es para que los botones, paginacion y filtros de busqueda se acomoden a sus necesidades, si quieren pueden buscar mas info en la documentacion de datatables, pero en este caso no es necesario.
            dom: ` 
            
            "<'row' <'col-sm-2 text-left'f><'col-sm-10 text-right'B>>"
            +"<'row'<'col-sm-12'tr>>"+
            "<'row' <'col-sm-4 text-left'i><'col-sm-4 pt-3 text-center'l><'col-sm-4 text-right'p>>" + 
            `,
            buttons: [ //? Estos son los botones que se van a mostrar en la tabla, si no quieres que se muestren, solo quita el array de botones y ya.

                {
                    text: 'Agregar Usuario <span class="fa fa-plus"></span> ',
                    className: 'btn btn-sm btn-primary',
                    action: function (e, dt, node, config) {
                        InsertarUsuario()
                    },
                },

            ],
            order: [[0, "desc"]],
            ordering: true,
            //scrollX:true,
            //scrollCollapse: false,
            //scrollY:        400,
            paging: true,
            responsive: true,
            deferRender: true,
            scroller: true,
            columnDefs: [
                // Center align both header and body content of columns 1, 2 & 3
                { className: "dt-center", targets: [0, 1, 2, 3, 4] }
            ],
            lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todos los registros"]],
            oLanguage: {
                "sSearch": "Buscar"
            },

            initComplete: function name(params) { //!Esta funcion es para crear un filtro en cada columna en el footer de la tabla, si no quieres que se muestre, solo quita el array de botones y ya.
                this.api().columns([0, 1, 2, 3, 4]).every(function () {
                    var column = this;
                    var select = $('<select class="form-control form-control-sm"><option value=""></option></select>')
                        .appendTo($(column.footer()).empty())
                        .on('change', function () {
                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).val()
                            );
                            column
                                .search(val ? '^' + val + '$' : '', true, false)
                                .draw();
                        });

                    column.data().unique().sort().each(function (d, index) {
                        select.append('<option value="' + d + '">' + d + '</option>')
                    });

                });
            }


        }
        )
    } catch (error) {
        console.log(error)
    }

}