import {Router} from "express"
import {
    obtenerFotos,
    obtenerFotoId,
    subirFotoBucketAws,
    borrarFoto,
} from "../controladores/foto.controller"
import {upload} from "../utils/multer.util"
import {verificacionToken} from '../controladores/usuario.controller'

const router = Router();


router.get('/api/fotos', obtenerFotos);
router.get('/api/foto/:id', obtenerFotoId);
router.delete('/api/eliminar/foto/:id', borrarFoto);
router.post('/api/guardar/foto',upload.single('imagen'),subirFotoBucketAws);

export default router;
