import { Response } from "express";
import fs from "fs";
import path from "path";
import { ProcesamientoServicio } from "../services/procesamientoServicio";
import { RequestConUsuario } from "../middlewares/authMiddleware";
import { AdminServicio } from "../services/adminServicio";

export class ProcesamientoControlador {
  static async crearLote(req: RequestConUsuario, res: Response) {
    try {
      const idUsuario = Number(req.usuario?.id_usuario);
      const token = req.token;
      const { imagenes } = req.body;

      if (!idUsuario || !token) {
        return res.status(401).json({
          mensaje: "Usuario no autenticado",
        });
      }

      if (!imagenes || !Array.isArray(imagenes) || imagenes.length === 0) {
        return res.status(400).json({
          mensaje: "Debe enviar una lista válida de imágenes",
        });
      }

      const resultado = await ProcesamientoServicio.crearSolicitudLote(
        token,
        idUsuario,
        {
          idUsuario,
          imagenes,
        }
      );

      return res.status(201).json({
        mensaje: "Lote enviado correctamente",
        data: resultado,
      });
    } catch (error: any) {
      console.error("Error en crearLote:", error);
      return res.status(500).json({
        mensaje: "Error al crear la solicitud de lote",
        error: error.message,
      });
    }
  }

  static async consultarEstado(req: RequestConUsuario, res: Response) {
    try {
      const token = req.token;
      const { idLote } = req.params;

      if (!token) {
        return res.status(401).json({
          mensaje: "Usuario no autenticado",
        });
      }

      const resultado = await ProcesamientoServicio.consultarEstadoSolicitud(
        token,
        Number(idLote)
      );

      return res.status(200).json({
        data: resultado,
      });
    } catch (error: any) {
      console.error("Error en consultarEstado:", error);
      return res.status(500).json({
        mensaje: "Error al consultar el estado del lote",
        error: error.message,
      });
    }
  }

  static async listarLotes(req: RequestConUsuario, res: Response) {
    try {
      const idUsuario = Number(req.usuario?.id_usuario);

      if (!idUsuario) {
        return res.status(401).json({
          mensaje: "Usuario no autenticado",
        });
      }

      const lotes = await ProcesamientoServicio.listarLotesPorUsuario(idUsuario);

      return res.status(200).json({
        data: lotes,
      });
    } catch (error: any) {
      console.error("Error en listarLotes:", error);
      return res.status(500).json({
        mensaje: "Error al listar los lotes",
        error: error.message,
      });
    }
  }

  static async detalleLote(req: RequestConUsuario, res: Response) {
    try {
      const idUsuario = Number(req.usuario?.id_usuario);
      const { idLote } = req.params;

      if (!idUsuario) {
        return res.status(401).json({
          mensaje: "Usuario no autenticado",
        });
      }

      const detalle = await ProcesamientoServicio.obtenerDetalleLote(
        idUsuario,
        Number(idLote)
      );

      return res.status(200).json({
        data: detalle,
      });
    } catch (error: any) {
      console.error("Error en detalleLote:", error);
      const status = error.message === "Lote no encontrado" ? 404 : 500;
      return res.status(status).json({
        mensaje: error.message || "Error al consultar el lote",
      });
    }
  }

  static async obtenerArchivo(req: RequestConUsuario, res: Response) {
    try {
      const ruta = String(req.query.ruta || "");

      if (!ruta) {
        return res.status(400).json({
          mensaje: "Debe enviar la ruta del archivo",
        });
      }

      const rutaAbsoluta = await ProcesamientoServicio.resolverRutaArchivo(ruta);

      if (!rutaAbsoluta || !fs.existsSync(rutaAbsoluta)) {
        return res.status(404).json({
          mensaje: "Archivo no encontrado",
        });
      }

      return res.sendFile(rutaAbsoluta);
    } catch (error: any) {
      console.error("Error en obtenerArchivo:", error);
      return res.status(500).json({
        mensaje: error.message || "Error al obtener el archivo",
      });
    }
  }

  static async logsLote(req: RequestConUsuario, res: Response) {
    try {
      const idUsuario = Number(req.usuario?.id_usuario);
      const { idLote } = req.params;

      if (!idUsuario) {
        return res.status(401).json({
          mensaje: "Usuario no autenticado",
        });
      }

      const logs = await ProcesamientoServicio.obtenerLogsLote(idUsuario, Number(idLote));

      return res.json({
        data: logs,
      });
    } catch (error: any) {
      console.error("Error en logsLote:", error);
      return res.status(400).json({
        mensaje: error.message || "Error al consultar logs del lote",
      });
    }
  }

  static async descargarZipLote(req: RequestConUsuario, res: Response) {
    try {
      const idUsuario = Number(req.usuario?.id_usuario);
      const { idLote } = req.params;

      if (!idUsuario) {
        return res.status(401).json({
          mensaje: "Usuario no autenticado",
        });
      }

      const { zipPath, cleanupDir, filename } = await ProcesamientoServicio.crearZipLote(
        idUsuario,
        Number(idLote)
      );

      return res.download(zipPath, filename, async () => {
        try {
          await fs.promises.rm(cleanupDir, { recursive: true, force: true });
        } catch (cleanupError) {
          console.error("Error limpiando zip temporal:", cleanupError);
        }
      });
    } catch (error: any) {
      console.error("Error en descargarZipLote:", error);
      return res.status(400).json({
        mensaje: error.message || "Error al generar el ZIP",
      });
    }
  }

  static async adminResumen(req: RequestConUsuario, res: Response) {
    try {
      if (req.usuario?.rol !== "ADMIN") {
        return res.status(403).json({
          mensaje: "Acceso restringido al administrador",
        });
      }

      const resumen = await AdminServicio.obtenerResumen();

      return res.json({
        data: resumen,
      });
    } catch (error: any) {
      console.error("Error en adminResumen:", error);
      return res.status(500).json({
        mensaje: error.message || "Error al consultar administración",
      });
    }
  }
}
