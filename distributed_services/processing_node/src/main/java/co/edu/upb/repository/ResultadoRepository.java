package co.edu.upb.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.time.LocalDateTime;
import java.math.BigDecimal;

import co.edu.upb.config.DatabaseConfig;

public class ResultadoRepository {

    public void guardar(
            Long idImagen,
            String rutaArchivo,
            String formatoSalida,
            double tiempoEjecucion,
            double tamanoArchivoKb) {
        String sql = """
            INSERT INTO resultado_procesamiento
            (id_imagen, ruta_archivo, formato_salida, fecha_generacion, tiempo_ejecucion, tamano_archivo_kb)
            VALUES (?, ?, ?, ?, ?, ?)
        """;

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, idImagen);
            ps.setString(2, rutaArchivo);
            ps.setString(3, formatoSalida);
            ps.setObject(4, LocalDateTime.now());
            ps.setDouble(5, tiempoEjecucion);
            ps.setBigDecimal(6, BigDecimal.valueOf(tamanoArchivoKb));

            ps.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("Error guardando resultado_procesamiento", e);
        }
    }
}
