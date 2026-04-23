import * as soap from "soap";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { promisify } from "util";
import { execFile } from "child_process";
import { env } from "../config/env";
import { processingDb } from "../config/bd";
import { SolicitudLoteDTO } from "../types/procesamiento";
import { unwrapSoapResult } from "../utils/soap";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads", "source");
const execFileAsync = promisify(execFile);
const REPO_ROOT = path.resolve(process.cwd(), "..", "..");

async function resolveStoredFilePath(ruta: string) {
  const normalized = String(ruta || "").trim();

  if (!normalized) {
    return null;
  }

  const candidates = [
    path.resolve(normalized),
    path.resolve(process.cwd(), normalized),
    path.resolve(REPO_ROOT, normalized),
    path.resolve(REPO_ROOT, "distributed_services", "processing_node", normalized),
  ];

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // seguir buscando
    }
  }

  return null;
}

export class ProcesamientoServicio {
  static async crearSolicitudLote(
    token: string,
    idUsuario: number,
    solicitud: SolicitudLoteDTO
  ) {
    const solicitudPreparada = await this.prepararImagenes(solicitud);
    const client = await soap.createClientAsync(env.SOAP_WSDL_URL);

    const [response] = await client.crearSolicitudLoteAsync({
      token,
      idUsuario,
      solicitudLoteDTO: solicitudPreparada,
    });

    return unwrapSoapResult(response);
  }

  static async consultarEstadoSolicitud(token: string, idLote: number) {
    const client = await soap.createClientAsync(env.SOAP_WSDL_URL);
    const [response] = await client.consultarEstadoSolicitudAsync({ token, idLote });
    return unwrapSoapResult(response);
  }

  static async listarLotesPorUsuario(idUsuario: number) {
    const [rows] = await processingDb.query(
      `
        SELECT
          sl.id_lote AS id,
          CASE
            WHEN COUNT(i.id_imagen) = 0 THEN sl.estado
            WHEN SUM(CASE WHEN i.estado IN ('PROCESADA', 'ERROR') THEN 1 ELSE 0 END) = COUNT(i.id_imagen)
              THEN CASE
                WHEN SUM(CASE WHEN i.estado = 'ERROR' THEN 1 ELSE 0 END) > 0 THEN 'ERROR'
                ELSE 'COMPLETADO'
              END
            WHEN SUM(CASE WHEN i.estado = 'EN_PROCESO' THEN 1 ELSE 0 END) > 0
              OR SUM(CASE WHEN i.estado = 'PROCESADA' THEN 1 ELSE 0 END) > 0 THEN 'EN_PROCESO'
            ELSE 'PENDIENTE'
          END AS estado,
          sl.fecha_recepcion AS fechaRecepcion,
          CASE
            WHEN COUNT(i.id_imagen) = 0 THEN sl.porcentaje_progreso
            ELSE ROUND(
              (
                SUM(CASE WHEN i.estado IN ('PROCESADA', 'ERROR') THEN 1 ELSE 0 END) * 100.0
              ) / COUNT(i.id_imagen),
              2
            )
          END AS porcentajeProgreso,
          sl.cantidad_imagenes AS cantidadImagenes,
          COUNT(i.id_imagen) AS totalImagenes,
          SUM(CASE WHEN i.estado = 'PROCESADA' THEN 1 ELSE 0 END) AS procesadas,
          SUM(CASE WHEN i.estado = 'ERROR' THEN 1 ELSE 0 END) AS fallidas,
          COALESCE(SUM(CASE WHEN i.estado = 'PROCESADA' THEN i.tiempo_ejecucion ELSE 0 END), 0) AS tiempoTotalEjecucion,
          COALESCE(AVG(CASE WHEN i.estado = 'PROCESADA' THEN i.tiempo_ejecucion END), 0) AS tiempoPromedioEjecucion
        FROM solicitud_lote sl
        LEFT JOIN imagen_solicitud i ON i.id_lote = sl.id_lote
        WHERE sl.usuario_id = ?
        GROUP BY sl.id_lote, sl.estado, sl.fecha_recepcion, sl.porcentaje_progreso, sl.cantidad_imagenes
        ORDER BY sl.id_lote DESC
      `,
      [idUsuario]
    );

    return rows;
  }

  static async obtenerDetalleLote(idUsuario: number, idLote: number) {
    const [lotes]: any = await processingDb.query(
      `
        SELECT
          sl.id_lote AS id,
          sl.usuario_id AS idUsuario,
          sl.estado,
          sl.fecha_recepcion AS fechaRecepcion,
          sl.porcentaje_progreso AS porcentajeProgreso,
          sl.cantidad_imagenes AS cantidadImagenes
        FROM solicitud_lote sl
        WHERE sl.id_lote = ? AND sl.usuario_id = ?
      `,
      [idLote, idUsuario]
    );

    if (!Array.isArray(lotes) || lotes.length === 0) {
      throw new Error("Lote no encontrado");
    }

    const [imagenes] = await processingDb.query(
      `
        SELECT
          i.id_imagen AS id,
          i.nombre_archivo AS nombreArchivo,
          i.ruta_original AS rutaOriginal,
          i.ruta_resultado AS rutaResultado,
          i.estado,
          i.formato_salida AS formatoSalida,
          i.tiempo_ejecucion AS tiempoEjecucion,
          i.fecha_procesamiento AS fechaProcesamiento,
          i.id_nodo AS idNodo,
          rp.ruta_archivo AS rutaArchivoResultado,
          rp.tamano_archivo_kb AS tamanoArchivoKb
        FROM imagen_solicitud i
        LEFT JOIN resultado_procesamiento rp ON rp.id_imagen = i.id_imagen
        WHERE i.id_lote = ?
        ORDER BY i.id_imagen ASC
      `,
      [idLote]
    );

    const [transformaciones]: any = await processingDb.query(
      `
        SELECT
          t.id_imagen AS idImagen,
          t.tipo,
          t.parametros AS valor,
          t.orden_transformacion AS orden
        FROM transformacion t
        INNER JOIN imagen_solicitud i ON i.id_imagen = t.id_imagen
        WHERE i.id_lote = ?
        ORDER BY t.id_imagen ASC, t.orden_transformacion ASC
      `,
      [idLote]
    );

    const transformacionesPorImagen = new Map<number, any[]>();

    for (const transformacion of transformaciones) {
      const lista = transformacionesPorImagen.get(transformacion.idImagen) || [];
      lista.push(transformacion);
      transformacionesPorImagen.set(transformacion.idImagen, lista);
    }

    return {
      ...lotes[0],
      imagenes: await Promise.all(
        (imagenes as any[]).map(async (imagen) => {
          let tamanoArchivoKb = imagen.tamanoArchivoKb;

          if ((!Number.isFinite(Number(tamanoArchivoKb)) || Number(tamanoArchivoKb) <= 0) && imagen.rutaArchivoResultado) {
            const rutaResuelta = await resolveStoredFilePath(imagen.rutaArchivoResultado);

            if (rutaResuelta) {
              try {
                const stats = await fs.stat(rutaResuelta);
                tamanoArchivoKb = Number((stats.size / 1024).toFixed(2));
              } catch {
                // seguir con el valor original
              }
            }
          }

          return {
            ...imagen,
            tamanoArchivoKb,
            transformaciones: transformacionesPorImagen.get(imagen.id) || [],
          };
        })
      ),
    };
  }

  static async obtenerLogsLote(idUsuario: number, idLote: number) {
    await this.obtenerDetalleLote(idUsuario, idLote);

    const [logs]: any = await processingDb.query(
      `
        SELECT
          lt.id_log AS id,
          lt.id_imagen AS idImagen,
          lt.nivel AS nivel,
          lt.mensaje AS mensaje,
          lt.fecha_hora AS fechaHora
        FROM log_trabajo lt
        INNER JOIN imagen_solicitud i ON i.id_imagen = lt.id_imagen
        INNER JOIN solicitud_lote sl ON sl.id_lote = i.id_lote
        WHERE sl.id_lote = ? AND sl.usuario_id = ?
        ORDER BY lt.fecha_hora DESC, lt.id_log DESC
      `,
      [idLote, idUsuario]
    );

    return logs;
  }

  static async crearZipLote(idUsuario: number, idLote: number) {
    const detalle = await this.obtenerDetalleLote(idUsuario, idLote);
    const archivos = detalle.imagenes
      .map((imagen: any) => imagen.rutaArchivoResultado as string | null)
      .filter((ruta: string | null): ruta is string => Boolean(ruta));

    if (archivos.length === 0) {
      throw new Error("El lote todavía no tiene archivos procesados para descargar");
    }

    const existentes: string[] = [];

    for (const archivo of archivos) {
      const rutaResuelta = await resolveStoredFilePath(archivo);
      if (rutaResuelta) {
        existentes.push(rutaResuelta);
      }
    }

    if (existentes.length === 0) {
      throw new Error("No se encontraron archivos procesados en disco");
    }

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `visionix-lote-${idLote}-`));
    const zipPath = path.join(tempDir, `lote-${idLote}.zip`);

    await execFileAsync("zip", ["-j", zipPath, ...existentes]);

    return {
      zipPath,
      cleanupDir: tempDir,
      filename: `visionix-lote-${idLote}.zip`,
    };
  }

  private static async prepararImagenes(solicitud: SolicitudLoteDTO) {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });

    const imagenes = await Promise.all(
      solicitud.imagenes.map(async (imagen, index) => {
        if (imagen.rutaOrigen) {
          return {
            nombreArchivo: imagen.nombreArchivo,
            rutaOrigen: imagen.rutaOrigen,
            transformaciones: imagen.transformaciones,
          };
        }

        if (!imagen.contenidoBase64) {
          throw new Error(`La imagen ${imagen.nombreArchivo} no tiene contenido`);
        }

        const contenidoLimpio = imagen.contenidoBase64.includes(",")
          ? imagen.contenidoBase64.split(",")[1]
          : imagen.contenidoBase64;

        const nombreSeguro = `${Date.now()}-${index}-${imagen.nombreArchivo.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const rutaArchivo = path.join(UPLOADS_DIR, nombreSeguro);

        await fs.writeFile(rutaArchivo, Buffer.from(contenidoLimpio, "base64"));

        return {
          nombreArchivo: imagen.nombreArchivo,
          rutaOrigen: rutaArchivo,
          transformaciones: imagen.transformaciones,
        };
      })
    );

    return {
      ...solicitud,
      imagenes,
    };
  }

  static async resolverRutaArchivo(ruta: string) {
    return resolveStoredFilePath(ruta);
  }
}
