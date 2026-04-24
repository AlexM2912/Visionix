import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { EventEmitter } from "events";

import { authDb, processingDb } from "./config/bd";
import { env } from "./config/env";
import authRutas from "./routes/authRutas";
import procesamientoRutas from "./routes/procesamientoRutas";
import { authMiddleware } from "./middlewares/authMiddleware";
import { ProcesamientoControlador } from "./controllers/procesamientoControlador";

EventEmitter.defaultMaxListeners = 20;

const app = express();
const PORT = env.PORT;

const STORAGE_PATH = process.env.STORAGE_PATH || path.join(process.cwd(), "storage");

app.use(cors());
app.use(express.json({ limit: "30mb" }));

app.use("/storage", express.static(path.resolve(STORAGE_PATH)));

app.get("/", (_req: Request, res: Response) => {
  res.json({
    mensaje: "Backend funcionando",
    entorno: env.NODE_ENV,
    servicioSOAP: env.SOAP_WSDL_URL,
    storage: "/storage",
  });
});

app.get("/api/health", async (_req: Request, res: Response) => {
  try {
    await Promise.all([
      authDb.query("SELECT 1"),
      processingDb.query("SELECT 1"),
    ]);

    return res.json({
      servidor: "activo",
      bdAuth: "conectada",
      bdProcesamiento: "conectada",
      soap: env.SOAP_WSDL_URL,
      storage: "activo",
    });
  } catch (error) {
    console.error("Error en health:", error);

    return res.status(500).json({
      servidor: "activo",
      bdAuth: "error",
      bdProcesamiento: "error",
      soap: env.SOAP_WSDL_URL,
    });
  }
});

app.use("/api/auth", authRutas);

app.get(
  "/api/procesamiento/archivo-publico",
  ProcesamientoControlador.obtenerArchivo
);

app.use("/api/procesamiento", authMiddleware, procesamientoRutas);

app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    mensaje: "Ruta no encontrada",
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`SOAP configurado en: ${env.SOAP_WSDL_URL}`);
  console.log(`Storage público en: http://localhost:${PORT}/storage`);
});