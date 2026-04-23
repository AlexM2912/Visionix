package co.edu.upb.repository;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;

import co.edu.upb.config.DatabaseConfig;
import co.edu.upb.entity.SolicitudLote;

public class SolicitudLoteRepository {

    public Long guardar(SolicitudLote lote) {
        String sql = """
                INSERT INTO solicitud_lote (usuario_id, fecha_recepcion, estado, porcentaje_progreso, cantidad_imagenes)
                VALUES (?, ?, ?, ?, ?)
                """;

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            System.out.println("DEBUG REPO 1 - Insertando en solicitud_lote usuario_id=" + lote.getUsuarioId());

            ps.setLong(1, lote.getUsuarioId());
            ps.setTimestamp(2, Timestamp.valueOf(lote.getFechaRecepcion()));
            ps.setString(3, lote.getEstado());
            ps.setBigDecimal(4, lote.getPorcentajeProgreso());
            ps.setInt(5, lote.getCantidadImagenes());

            int filas = ps.executeUpdate();
            System.out.println("DEBUG REPO 2 - Filas afectadas en solicitud_lote: " + filas);

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    Long idGenerado = rs.getLong(1);
                    System.out.println("DEBUG REPO 3 - id_lote generado: " + idGenerado);
                    return idGenerado;
                }
            }

            throw new RuntimeException("No se pudo obtener id_lote.");
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error guardando solicitud_lote.", e);
        }
    }

    public SolicitudLote buscarPorId(Long idLote) {
        String sql = "SELECT * FROM solicitud_lote WHERE id_lote = ?";

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setLong(1, idLote);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapear(rs);
                }
            }

            return null;
        } catch (SQLException e) {
            throw new RuntimeException("Error buscando lote.", e);
        }
    }

    public void actualizarEstadoYProgreso(Long idLote, String estado, BigDecimal progreso) {
        String sql = """
                UPDATE solicitud_lote
                SET estado = ?, porcentaje_progreso = ?
                WHERE id_lote = ?
                """;

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, estado);
            ps.setBigDecimal(2, progreso);
            ps.setLong(3, idLote);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error actualizando lote.", e);
        }
    }

    private SolicitudLote mapear(ResultSet rs) throws SQLException {
        SolicitudLote lote = new SolicitudLote();
        lote.setIdLote(rs.getLong("id_lote"));
        lote.setUsuarioId(rs.getLong("usuario_id"));
        lote.setFechaRecepcion(rs.getTimestamp("fecha_recepcion").toLocalDateTime());
        lote.setEstado(rs.getString("estado"));
        lote.setPorcentajeProgreso(rs.getBigDecimal("porcentaje_progreso"));
        lote.setCantidadImagenes(rs.getInt("cantidad_imagenes"));
        return lote;
    }
}