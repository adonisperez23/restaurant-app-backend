import "reflect-metadata";
import {Request, Response} from "express";
import app from "./app";
import {LocalDataSource} from "./utils/dataSource.util"; // tenemos la instancia en el contenedor de dependencias

const PORT = process.env.PORT || 3000;
async function main(){
    try{
        const localDataSource = new LocalDataSource()
        // creando instancia con la configuracion de la bases de datos local
        await localDataSource
        .initialize()
        .then(()=>{
          console.log("la fuente de datos ha sido inicializada");
        })
        .catch((err:any)=>{
          console.log(`ha ocurrido el error : ${err}`);
        });

        await app.listen(PORT, ()=>{
          console.log(`servidor encendido en el puerto ${PORT}`);
        })


    }catch(error){
        console.log(error);
    }

    }

main();
