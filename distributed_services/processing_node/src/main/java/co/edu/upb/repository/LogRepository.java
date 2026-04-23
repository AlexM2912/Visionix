package co.edu.upb.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.time.LocalDateTime;

import co.edu.upb.config.DatabaseConfig;

public class LogRepository {

    public void guardar(Long idImagen, String nivel, String mensaje) {
        String sql = """
            INSERT INTO log_trabajo
            (id_imagen, nivel, mensaje, fecha_hora)
            VALUES (?, ?, ?, ?)
        """;

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, idImagen);
            ps.setString(2, nivel);
            ps.setString(3, mensaje);
            ps.setObject(4, LocalDateTime.now());

            ps.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("Error guardando log_trabajo", e);
        }
    }
}