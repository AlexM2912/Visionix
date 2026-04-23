package co.edu.upb.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;

import co.edu.upb.config.DatabaseConfig;
import co.edu.upb.entity.CodigoVerificacion;

public class CodigoVerificacionRepository {

    public Long guardar(CodigoVerificacion codigo) {
        String sql = """
                INSERT INTO codigo_verificacion (id_usuario, codigo, tipo, fecha_creacion, fecha_expiracion, usado)
                VALUES (?, ?, ?, ?, ?, ?)
                """;

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setLong(1, codigo.getIdUsuario());
            ps.setString(2, codigo.getCodigo());
            ps.setString(3, codigo.getTipo());
            ps.setTimestamp(4, Timestamp.valueOf(codigo.getFechaCreacion()));
            ps.setTimestamp(5, Timestamp.valueOf(codigo.getFechaExpiracion()));
            ps.setBoolean(6, codigo.isUsado());

            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getLong(1);
                }
            }

            throw new RuntimeException("No se pudo obtener el id del código.");
        } catch (SQLException e) {
            throw new RuntimeException("Error guardando código de verificación.", e);
        }
    }

    public CodigoVerificacion buscarCodigoVigente(Long idUsuario, String codigo, String tipo) {
        String sql = """
                SELECT * FROM codigo_verificacion
                WHERE id_usuario = ?
                  AND codigo = ?
                  AND tipo = ?
                  AND usado = false
                ORDER BY fecha_creacion DESC
                LIMIT 1
                """;

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setLong(1, idUsuario);
            ps.setString(2, codigo);
            ps.setString(3, tipo);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapearCodigo(rs);
                }
            }

            return null;
        } catch (SQLException e) {
            throw new RuntimeException("Error buscando código vigente.", e);
        }
    }

    public void marcarComoUsado(Long idCodigo) {
        String sql = "UPDATE codigo_verificacion SET usado = true WHERE id_codigo = ?";

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setLong(1, idCodigo);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error marcando código como usado.", e);
        }
    }

    private CodigoVerificacion mapearCodigo(ResultSet rs) throws SQLException {
        CodigoVerificacion codigo = new CodigoVerificacion();
        codigo.setIdCodigo(rs.getLong("id_codigo"));
        codigo.setIdUsuario(rs.getLong("id_usuario"));
        codigo.setCodigo(rs.getString("codigo"));
        codigo.setTipo(rs.getString("tipo"));
        codigo.setFechaCreacion(rs.getTimestamp("fecha_creacion").toLocalDateTime());
        codigo.setFechaExpiracion(rs.getTimestamp("fecha_expiracion").toLocalDateTime());
        codigo.setUsado(rs.getBoolean("usado"));
        return codigo;
    }
}