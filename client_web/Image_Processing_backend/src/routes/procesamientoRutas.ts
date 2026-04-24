import { Router } from "express";
import { ProcesamientoControlador } from "../controllers/procesamientoControlador";

const router = Router();

router.get("/admin/resumen", ProcesamientoControlador.adminResumen);
router.get("/lotes", ProcesamientoControlador.listarLotes);

router.get("/archivo", ProcesamientoControlador.obtenerArchivo);
router.get("/archivo-publico", ProcesamientoControlador.obtenerArchivo);

router.post("/lote", ProcesamientoControlador.crearLote);
router.get("/lote/:idLote", ProcesamientoControlador.detalleLote);
router.get("/lote/:idLote/logs", ProcesamientoControlador.logsLote);
router.get("/lote/:idLote/zip", ProcesamientoControlador.descargarZipLote);
router.get("/estado/:idLote", ProcesamientoControlador.consultarEstado);

export default router;