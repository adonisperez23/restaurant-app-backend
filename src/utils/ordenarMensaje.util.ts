import moment from "moment"

// metodo para armar el mensaje que se enviara al whatsap de la persona encargada de recibir los pedidos
async function armarMensaje (fecha:string,telefono:string, cliente:string, pedido:Array<{producto:number,nombreProducto:string,cantidad:number,precio:number,descripcion:string}>, montoTotal:number):Promise<string>{
  let pedidoOrdenado:string = ""
  let montoTo = montoTotal.toString()
  let formatoFecha:string = moment(fecha).format('DD/MM/YYYY h:mm a')
  let totalProductos:number = 0

  pedido.forEach((articulo)=>{
    let cantidadArticulo = articulo.cantidad.toString()
    let precioArticulo = articulo.precio.toString()
    let monto = (articulo.precio * articulo.cantidad).toString()
    totalProductos += articulo.cantidad

    pedidoOrdenado += `\n${articulo.nombreProducto}  \n ${articulo.descripcion}\n
                            $${precioArticulo}            ${cantidadArticulo}             $${monto} \n`

  })

  return `Rest. Los Cinco Sabores\n
Fecha: ${formatoFecha}\n
Cliente: ${cliente}\n
Telefono: ${telefono}\n
Pedido: \n
Descripcion   Precio   Cantidad    Monto
${pedidoOrdenado} \n
MONTO TOTAL: $${montoTo}\n
Cantidad Total de Productos: ${totalProductos}\n
NOTA:\n
Por favor espere que su pedido sea verificado por el Administrador.\n

Datos de Pago movil: \n
Tlf: 0414-8942782
CI: 23.917.268 
Bancos: Mercantil 0105`

}

export {armarMensaje};
