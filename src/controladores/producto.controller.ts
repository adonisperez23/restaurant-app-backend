import {Request,Response} from "express";
import {Producto} from "../entidades/Producto";
import {Pedido} from "../entidades/Pedido";
import {Foto} from "../entidades/Foto";
import {validate} from "class-validator";
import { capitalize } from 'capitalize-ts';

export const obtenerProductos = async (req:Request,res:Response) =>{

    try {
        const productos = await Producto.find();

        res.status(200).send(productos);
    }
    catch(error){
        res.status(404).json({error:`Ha ocurrido un error al obtener productos: ${error}`})
    }
}

// API que verifica si un registro de producto tiene algun registro con otra tabla relacionada
export const verificarRelacionesProducto = async (req:Request,res:Response) =>{

    try {
        const {productoId} = req.params// recibe id del producto a verificar
        let producto = Number(productoId)
        const pedidos = await Pedido.createQueryBuilder("pedido")
           .leftJoinAndSelect("pedido.producto", "producto")
           .where("producto.id = :producto", { producto })
           .getMany()
         // lista Pedidos
        const fotos = await Foto.createQueryBuilder("foto")
           .leftJoinAndSelect("foto.producto", "producto")
           .where("producto.id = :producto", { producto })
           .getMany()
         // lista fotos

        if(fotos.length > 0 || pedidos.length > 0){
          return res.status(200).json({estaRelacionado:true});
        } else {
          return res.status(200).json({estaRelacionado:false});
        }

    }
    catch(error){
        return res.status(404).json({error:"Error al Verificar relaciones de productos"})
    }
}

export const obtenerProductoId = async (req:Request, res:Response) => {

        try {
            const {id} = req.params;

            const producto = await Producto.findOneBy({id: parseInt(id)})

            if(!producto){
                return res.status(406).json({error:`no existe producto con el ID: ${id}`})
            }

            res.status(200).send(producto)
        }catch(error){
            res.status(400).json({error:`Ha ocurrido un error al traer producto por id: ${error}`})
    }
}

export const registrarProducto = async (req:Request,res:Response)=>{

    try{
        let {
            nombreProducto,
            categoria,
            descripcion,
            precio,
            disponible} = req.body;

        const producto = new Producto();

        if(descripcion.length === 0){
            descripcion = "Por ahora no hay una descripcion del producto"
        }
        if(precio === null || precio.length === 0){
            precio = 0
        }

        producto.nombreProducto = capitalize(nombreProducto);
        producto.categoria = capitalize(categoria);
        producto.descripcion = descripcion;
        producto.precio = precio;
        producto.disponible = disponible;

        const errores = await validate(producto, { validationError: { target: false } });
        if(errores.length > 0){
          res.status(400).json({error:`ha ocurrido un error ${errores}`});
        } else{
            await producto.save();
            res.status(201).json({mensaje:`Producto creado`});
        }

    }catch(error){
        res.status(400).json({error:`Ha ocurrido un error al registrar producto:${error}`})
    }
}

export const actualizarProducto = async (req:Request, res:Response)=>{
    try{
        const producto = await Producto.findOneBy({id: parseInt(req.params.id)});

        if(!producto){
            return res.status(404).json({mensaje:`Producto con el id no existe:${req.params.id}`});
        };
        let {
            nombreProducto,
            categoria,
            descripcion,
            precio,
            disponible
          } = req.body;

        producto.nombreProducto = nombreProducto;
        producto.categoria = categoria;
        producto.descripcion = descripcion;
        producto.precio = precio;
        producto.disponible = disponible;

        const errores = await validate(producto,{ validationError: { target: false } })
        if(errores.length > 0) {
          return res.status(406).json(errores);
        } else {
          await producto.save()
          res.status(200).json({mensaje:"Producto modificado"});
        }
        // await Producto.update({id:parseInt(req.params.id)}, req.body);

    }catch(error){
        res.status(400).json({error:`Ha ocurrido un error al actualizar producto: ${error}`});
    }
}

export const eliminarProducto = async (req:Request, res:Response) =>{

    try{
        const producto = await Producto.findOneBy({id: parseInt(req.params.id)});

        if(!producto){
            return res.status(404).json({error:"el producto que desea eliminar con el id no existe"});
        };

        const result = await Producto.delete({id:parseInt(req.params.id)});

        res.status(201).json({mensaje:"Producto eliminado con exito"})
    }catch(error){
        res.status(400).json({error:`Ha ocurrido un error al eliminar producto: ${error}`})
    }
}
