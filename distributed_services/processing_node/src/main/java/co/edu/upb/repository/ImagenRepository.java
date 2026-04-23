package co.edu.upb.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;

import co.edu.upb.config.DatabaseConfig;

public class ImagenRepository {

    public void marcarProcesando(Long idImagen, Long idNodo) {
        String sql = """
            UPDATE imagen_solicitud
            SET estado = 'PROCESANDO',
                id_nodo = ?
            WHERE id_imagen = ?
        """;

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, idNodo);
            ps.setLong(2, idImagen);

            ps.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("Error marcando imagen como PROCESANDO", e);
        }
    }

    public void marcarProcesada(Long idImagen, String rutaResultado, Long idNodo, double tiempoEjecucion) {
        String sql = """
            UPDATE imagen_solicitud
            SET estado = 'PROCESADA',
                ruta_resultado = ?,
                fecha_procesamiento = NOW(),
                id_nodo = ?,
                tiempo_ejecucion = ?
            WHERE id_imagen = ?
        """;

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, rutaResultado);
            ps.setLong(2, idNodo);
            ps.setDouble(3, tiempoEjecucion);
            ps.setLong(4, idImagen);

            ps.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("Error marcando imagen como PROCESADA", e);
        }
    }

    public void marcarError(Long idImagen, Long idNodo) {
        String sql = """
            UPDATE imagen_solicitud
            SET estado = 'ERROR',
                fecha_procesamiento = NOW(),
                id_nodo = ?
            WHERE id_imagen = ?
        """;

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, idNodo);
            ps.setLong(2, idImagen);

            ps.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("Error marcando imagen como ERROR", e);
        }
    }
}