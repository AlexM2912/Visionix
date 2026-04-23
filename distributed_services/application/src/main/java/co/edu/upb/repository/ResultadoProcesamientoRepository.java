package co.edu.upb.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;

import co.edu.upb.config.DatabaseConfig;
import co.edu.upb.entity.ResultadoProcesamiento;

public class ResultadoProcesamientoRepository {

    public void guardar(ResultadoProcesamiento resultado) {
        String sql = """
                INSERT INTO resultado_procesamiento
                (id_imagen, ruta_archivo, formato_salida, fecha_generacion, tiempo_ejecucion, tamano_archivo_kb)
                VALUES (?, ?, ?, ?, ?, ?)
                """;

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setLong(1, resultado.getIdImagen());
            ps.setString(2, resultado.getRutaArchivo());
            ps.setString(3, resultado.getFormatoSalida());
            ps.setTimestamp(4, Timestamp.valueOf(resultado.getFechaGeneracion()));
            ps.setBigDecimal(5, resultado.getTiempoEjecucion());
            ps.setBigDecimal(6, resultado.getTamanoArchivoKb());

            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error guardando resultado_procesamiento.", e);
        }
    }
}