import multer from "multer"
import {Request} from "express"
// Modulo para enviar imagenes desde el cliente al servidor
const storage = multer.memoryStorage(); // Utiliza memoria para almacenar el archivo temporalmente
export const upload = multer({storage})
