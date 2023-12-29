import {Request,Response} from "express";
import {Foto} from "../entidades/Foto";
import {Producto} from "../entidades/Producto";
import {validate} from "class-validator";
import {generarId} from "../utils/uuidGenerator"
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";
const fs = require('fs').promises
require('dotenv').config()


export const obtenerFotos = async (req:Request,res:Response) =>{

    try {
        const fotos = await Foto.find({
                              select:{
                                  id:true,
                                  nombreFoto:true,
                                  direccionUrl:true
                                },
                                relations:{
                                  producto:true
                                }
                              });

        res.status(200).send(fotos);
    }
    catch(error){
        res.status(404).json({error:`Ha ocurrido un error al obtener fotos: ${error}`})
    }
}

export const obtenerFotoId = async (req:Request, res:Response) => {

        try {
            const {id} = req.params;

            const foto = await Foto.findOneBy({id: parseInt(id)})

            if(!foto){
                return res.status(406).json({error:`No existe foto con el ID: ${id}`})
            }

            res.status(200).json({foto:foto,hostname:req.headers.host})
        }catch(error){
            res.status(400).json({error:`Ha ocurrido un error al obtener foto por id: ${error}`})
    }
}

export const subirFotoBucketAws = async (req:Request,res:Response)=>{
    try{

        let {
            data
            } = req.body;

        let infoFoto =  JSON.parse(data)
        let uuid = generarId()
        let nombreFoto:string = ''
        console.log("body",data)
        console.log("imagen",req.file)

        if(req.file != undefined && process.env.AWS_REGION !=undefined && process.env.AWS_PUBLIC_KEY !=undefined && process.env.AWS_SECRET_KEY !=undefined && process.env.AWS_BUCKET_NAME != undefined ){

          nombreFoto = uuid+req.file.originalname

          let credenciales = {
            region:process.env.AWS_REGION,
            credentials:{
              accessKeyId:process.env.AWS_PUBLIC_KEY,
              secretAccessKey:process.env.AWS_SECRET_KEY
            },
          }

          let parametrosDeCargaImagen = {
            Bucket:process.env.AWS_BUCKET_NAME,
            Body: req.file.buffer,
            Key: nombreFoto,
          }

          const putCommand = new PutObjectCommand(parametrosDeCargaImagen)
          const s3Client = new S3Client(credenciales)
          const resultado = await s3Client.send(putCommand)
          if(resultado.$metadata.httpStatusCode != 200){
            return res.status(400).json({error:"No se pudo guardar la imagen en el bucket s3"})
          }
        } else {
          return res.status(400).json({error:"Debe adjuntar una imagen para cargar"})
        }



        const producto = await Producto.findOneBy({id:infoFoto.id});

        if(!producto){
            return res.status(400).json({error:"El producto que selecciono no existe, ingrese otro nuevamente"});
        }

        const foto = new Foto();

        foto.nombreFoto = infoFoto.nombreFoto;
        foto.direccionUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${nombreFoto}`;
        foto.producto = producto;

        const errores = await validate(foto,{ validationError: { target: false } });

        if(errores.length > 0){
          return res.status(406).json({error:`Error de validadion:${errores}`});
        } else {
          await foto.save();
          res.status(201).json({mensaje:"Foto cargada con exito"})
        }

    }catch(error){
        res.status(400).json({error:`Ha ocurrido un error al subir foto:${error}`})
    }
}


export const borrarFoto = async (req:Request, res:Response) =>{

    try{
        const foto = await Foto.findOneBy({id: parseInt(req.params.id)});
        // console.log("headers", req.headers)
        if(!foto){
            return res.status(404).json({error:"La foto que desea eliminar con el id no existe"});
        } else {
          try {
            let nombreFotoEliminar = foto.direccionUrl.split('.com/')
            if(process.env.AWS_REGION !=undefined && process.env.AWS_PUBLIC_KEY !=undefined && process.env.AWS_SECRET_KEY !=undefined && process.env.AWS_BUCKET_NAME != undefined ){
              let credenciales = {
                region:process.env.AWS_REGION,
                credentials:{
                  accessKeyId:process.env.AWS_PUBLIC_KEY,
                  secretAccessKey:process.env.AWS_SECRET_KEY
                },
              }

              let parametrosEliminacion = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key:nombreFotoEliminar[1],
              };
              const deleteCommand = new DeleteObjectCommand(parametrosEliminacion)
              const s3Client = new S3Client(credenciales)
              const resultado = await s3Client.send(deleteCommand)
              if(!resultado){
                return res.status(400).json({error:"No se pudo eliminar la imagen en el bucket s3",err:resultado})
              }
              const result = await Foto.delete({id:parseInt(req.params.id)});
              if(result){
                res.status(201).json({mensaje:"Foto eliminada!"})
              }
            } else {
              return res.status(400).json({error:"No se pudo eliminar la foto guardada"})
            }

          } catch (error) {
            console.log("error al eliminar foto de carpeta",error)
            return res.status(404).json({error:"Ha ocurrido un error al eliminar la foto"})
          }
        }

    }catch(error){
        res.status(400).json({error:`Ha ocurrido un error al eliminar foto: ${error}`})
    }
}
