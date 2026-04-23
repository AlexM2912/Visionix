package co.edu.upb.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;

import co.edu.upb.config.DatabaseConfig;
import co.edu.upb.entity.Sesion;

public class SesionRepository {

    public Long guardar(Sesion sesion) {
        String sql = """
                INSERT INTO sesion (id_usuario, token, fecha_creacion, fecha_expiracion, estado)
                VALUES (?, ?, ?, ?, ?)
                """;

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setLong(1, sesion.getIdUsuario());
            ps.setString(2, sesion.getToken());
            ps.setTimestamp(3, Timestamp.valueOf(sesion.getFechaCreacion()));
            ps.setTimestamp(4, Timestamp.valueOf(sesion.getFechaExpiracion()));
            ps.setString(5, sesion.getEstado());

            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getLong(1);
                }
            }

            throw new RuntimeException("No se pudo obtener el id de sesión.");
        } catch (SQLException e) {
            throw new RuntimeException("Error guardando sesión.", e);
        }
    }

    public Sesion buscarPorToken(String token) {
        String sql = "SELECT * FROM sesion WHERE token = ?";

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, token);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapearSesion(rs);
                }
            }

            return null;
        } catch (SQLException e) {
            throw new RuntimeException("Error buscando sesión por token.", e);
        }
    }

    public void cerrarSesion(String token) {
        String sql = "UPDATE sesion SET estado = 'CERRADA' WHERE token = ?";

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, token);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error cerrando sesión.", e);
        }
    }

    public void cerrarSesionesUsuario(Long idUsuario) {
        String sql = "UPDATE sesion SET estado = 'CERRADA' WHERE id_usuario = ? AND estado = 'ACTIVA'";

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setLong(1, idUsuario);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error cerrando sesiones del usuario.", e);
        }
    }

    private Sesion mapearSesion(ResultSet rs) throws SQLException {
        Sesion sesion = new Sesion();
        sesion.setIdSesion(rs.getLong("id_sesion"));
        sesion.setIdUsuario(rs.getLong("id_usuario"));
        sesion.setToken(rs.getString("token"));
        sesion.setFechaCreacion(rs.getTimestamp("fecha_creacion").toLocalDateTime());
        sesion.setFechaExpiracion(rs.getTimestamp("fecha_expiracion").toLocalDateTime());
        sesion.setEstado(rs.getString("estado"));
        return sesion;
    }
}
