package co.edu.upb.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;

import co.edu.upb.config.DatabaseConfig;
import co.edu.upb.entity.Usuario;

public class UsuarioRepository {

    public Usuario buscarPorEmail(String email) {
        String sql = "SELECT * FROM usuario WHERE email = ?";

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, email);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapearUsuario(rs);
                }
            }

            return null;
        } catch (SQLException e) {
            throw new RuntimeException("Error buscando usuario por email.", e);
        }
    }

    public Usuario buscarPorId(Long idUsuario) {
        String sql = "SELECT * FROM usuario WHERE id_usuario = ?";

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setLong(1, idUsuario);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapearUsuario(rs);
                }
            }

            return null;
        } catch (SQLException e) {
            throw new RuntimeException("Error buscando usuario por id.", e);
        }
    }

    public Long guardar(Usuario usuario) {
        String sql = """
                INSERT INTO usuario (nombre, email, password_hash, rol, estado, fecha_creacion, fecha_activacion)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """;

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, usuario.getNombre());
            ps.setString(2, usuario.getEmail());
            ps.setString(3, usuario.getPasswordHash());
            ps.setString(4, usuario.getRol());
            ps.setString(5, usuario.getEstado());
            ps.setTimestamp(6, Timestamp.valueOf(usuario.getFechaCreacion()));

            if (usuario.getFechaActivacion() != null) {
                ps.setTimestamp(7, Timestamp.valueOf(usuario.getFechaActivacion()));
            } else {
                ps.setTimestamp(7, null);
            }

            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getLong(1);
                }
            }

            throw new RuntimeException("No se pudo obtener el id generado del usuario.");
        } catch (SQLException e) {
            throw new RuntimeException("Error guardando usuario.", e);
        }
    }

    public void activarUsuario(Long idUsuario) {
        String sql = """
                UPDATE usuario
                SET estado = 'ACTIVO', fecha_activacion = CURRENT_TIMESTAMP
                WHERE id_usuario = ?
                """;

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setLong(1, idUsuario);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error activando usuario.", e);
        }
    }

    public void actualizarPassword(Long idUsuario, String passwordHash) {
        String sql = """
                UPDATE usuario
                SET password_hash = ?
                WHERE id_usuario = ?
                """;

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, passwordHash);
            ps.setLong(2, idUsuario);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error actualizando contraseña.", e);
        }
    }

    private Usuario mapearUsuario(ResultSet rs) throws SQLException {
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(rs.getLong("id_usuario"));
        usuario.setNombre(rs.getString("nombre"));
        usuario.setEmail(rs.getString("email"));
        usuario.setPasswordHash(rs.getString("password_hash"));
        usuario.setRol(rs.getString("rol"));
        usuario.setEstado(rs.getString("estado"));

        Timestamp fechaCreacion = rs.getTimestamp("fecha_creacion");
        if (fechaCreacion != null) {
            usuario.setFechaCreacion(fechaCreacion.toLocalDateTime());
        }

        Timestamp fechaActivacion = rs.getTimestamp("fecha_activacion");
        if (fechaActivacion != null) {
            usuario.setFechaActivacion(fechaActivacion.toLocalDateTime());
        }

        return usuario;
    }
}
