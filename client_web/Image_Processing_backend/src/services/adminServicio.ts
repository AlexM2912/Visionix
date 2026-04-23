import { processingDb } from "../config/bd";

export class AdminServicio {
  static async obtenerResumen() {
    const [lotesResult, imagenesResult, nodosResult, logsResult] = await Promise.all([
      processingDb.query(
        `
          SELECT
            COUNT(*) AS totalLotes,
            SUM(CASE WHEN estado = 'COMPLETADO' THEN 1 ELSE 0 END) AS lotesCompletados,
            SUM(CASE WHEN estado = 'EN_PROCESO' THEN 1 ELSE 0 END) AS lotesEnProceso,
            SUM(CASE WHEN estado = 'ERROR' THEN 1 ELSE 0 END) AS lotesError
          FROM solicitud_lote
        `
      ),
      processingDb.query(
        `
          SELECT
            COUNT(*) AS totalImagenes,
            SUM(CASE WHEN estado = 'PROCESADA' THEN 1 ELSE 0 END) AS procesadas,
            SUM(CASE WHEN estado = 'ERROR' THEN 1 ELSE 0 END) AS conError
          FROM imagen_solicitud
        `
      ),
      processingDb.query(
        `
          SELECT
            COUNT(*) AS totalNodos,
            SUM(CASE WHEN estado = 'ACTIVO' THEN 1 ELSE 0 END) AS nodosActivos
          FROM nodo_trabajador
        `
      ),
      processingDb.query(
        `
          SELECT COUNT(*) AS totalLogs
          FROM log_trabajo
        `
      ),
    ]);

    const [lotes]: any = lotesResult;
    const [imagenes]: any = imagenesResult;
    const [nodos]: any = nodosResult;
    const [logs]: any = logsResult;

    const [metricRows]: any = await processingDb.query(
      `
        SELECT
          DATE_FORMAT(MIN(fecha_recepcion), '%H:00') AS time,
          COUNT(*) AS requests
        FROM solicitud_lote
        WHERE fecha_recepcion >= NOW() - INTERVAL 12 HOUR
        GROUP BY DATE_FORMAT(fecha_recepcion, '%Y-%m-%d %H:00')
        ORDER BY MIN(fecha_recepcion)
      `
    );

    const [nodeRows]: any = await processingDb.query(
      `
        SELECT
          nt.id_nodo AS id,
          nt.nombre AS name,
          nt.direccion_red AS location,
          nt.estado,
          nt.carga_actual AS currentLoad,
          nt.capacidad_maxima AS maxCapacity,
          COUNT(CASE WHEN i.estado = 'PROCESADA' AND DATE(i.fecha_procesamiento) = CURDATE() THEN 1 END) AS processedToday,
          COUNT(CASE WHEN i.estado = 'EN_PROCESO' THEN 1 END) AS processingNow
        FROM nodo_trabajador nt
        LEFT JOIN imagen_solicitud i ON i.id_nodo = nt.id_nodo
        GROUP BY nt.id_nodo, nt.nombre, nt.direccion_red, nt.estado, nt.carga_actual, nt.capacidad_maxima
        ORDER BY nt.id_nodo ASC
      `
    );

    const [logRows]: any = await processingDb.query(
      `
        SELECT
          DATE_FORMAT(lt.fecha_hora, '%H:%i:%s') AS time,
          LOWER(lt.nivel) AS level,
          CONCAT('Imagen #', lt.id_imagen) AS service,
          lt.mensaje AS message
        FROM log_trabajo lt
        ORDER BY lt.fecha_hora DESC
        LIMIT 40
      `
    );

    const totalLotes = Number(lotes[0]?.totalLotes || 0);
    const lotesCompletados = Number(lotes[0]?.lotesCompletados || 0);
    const health = totalLotes > 0 ? Math.round((lotesCompletados / totalLotes) * 100) : 0;

    return {
      summary: {
        totalLotes,
        lotesCompletados,
        lotesEnProceso: Number(lotes[0]?.lotesEnProceso || 0),
        lotesError: Number(lotes[0]?.lotesError || 0),
        totalImagenes: Number(imagenes[0]?.totalImagenes || 0),
        imagenesProcesadas: Number(imagenes[0]?.procesadas || 0),
        imagenesError: Number(imagenes[0]?.conError || 0),
        totalNodos: Number(nodos[0]?.totalNodos || 0),
        nodosActivos: Number(nodos[0]?.nodosActivos || 0),
        totalLogs: Number(logs[0]?.totalLogs || 0),
        health,
      },
      systemMetrics: metricRows.map((row: any) => ({
        time: row.time,
        cpu: 0,
        memory: 0,
        requests: Number(row.requests || 0),
      })),
      nodes: nodeRows.map((row: any) => {
        const currentLoad = Number(row.currentLoad || 0);
        const maxCapacity = Number(row.maxCapacity || 1);
        const usage = Math.min(100, Math.round((currentLoad / Math.max(1, maxCapacity)) * 100));
        return {
          id: String(row.id),
          name: row.name,
          status: row.estado === "ACTIVO" ? "online" : "offline",
          location: row.location,
          cpu: usage,
          memory: usage,
          disk: Math.min(100, Math.max(10, usage + 10)),
          uptime: row.estado === "ACTIVO" ? "Activo" : "Sin conexión",
          processedToday: Number(row.processedToday || 0),
          processingNow: Number(row.processingNow || 0),
          currentLoad,
          maxCapacity,
        };
      }),
      systemLogs: logRows,
    };
  }
}
