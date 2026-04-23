package co.edu.upb.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;

import co.edu.upb.config.DatabaseConfig;
import co.edu.upb.entity.LogTrabajo;

public class LogTrabajoRepository {

    public void guardar(LogTrabajo logTrabajo) {
        String sql = """
                INSERT INTO log_trabajo (id_imagen, nivel, mensaje, fecha_hora)
                VALUES (?, ?, ?, ?)
                """;

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setLong(1, logTrabajo.getIdImagen());
            ps.setString(2, logTrabajo.getNivel());
            ps.setString(3, logTrabajo.getMensaje());
            ps.setTimestamp(4, Timestamp.valueOf(logTrabajo.getFechaHora()));

            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error guardando log_trabajo.", e);
        }
    }
}