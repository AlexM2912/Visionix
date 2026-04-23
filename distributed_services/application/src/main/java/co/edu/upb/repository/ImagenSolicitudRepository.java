package co.edu.upb.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import co.edu.upb.config.DatabaseConfig;
import co.edu.upb.entity.ImagenSolicitud;

public class ImagenSolicitudRepository {

    public Long guardar(ImagenSolicitud imagen) {
        String sql = """
                INSERT INTO imagen_solicitud (
                    id_lote, nombre_archivo, ruta_original, ruta_resultado,
                    formato_entrada, formato_salida, estado,
                    fecha_recepcion, fecha_procesamiento, tiempo_ejecucion, id_nodo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setLong(1, imagen.getIdLote());
            ps.setString(2, imagen.getNombreArchivo());
            ps.setString(3, imagen.getRutaOriginal());
            ps.setString(4, imagen.getRutaResultado());
            ps.setString(5, imagen.getFormatoEntrada());
            ps.setString(6, imagen.getFormatoSalida());
            ps.setString(7, imagen.getEstado());
            ps.setTimestamp(8, Timestamp.valueOf(imagen.getFechaRecepcion()));

            if (imagen.getFechaProcesamiento() != null) {
                ps.setTimestamp(9, Timestamp.valueOf(imagen.getFechaProcesamiento()));
            } else {
                ps.setNull(9, java.sql.Types.TIMESTAMP);
            }

            if (imagen.getTiempoEjecucion() != null) {
                ps.setBigDecimal(10, imagen.getTiempoEjecucion());
            } else {
                ps.setNull(10, java.sql.Types.DECIMAL);
            }

            if (imagen.getIdNodo() != null) {
                ps.setLong(11, imagen.getIdNodo());
            } else {
                ps.setNull(11, java.sql.Types.BIGINT);
            }

            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getLong(1);
                }
            }

            throw new RuntimeException("No se pudo obtener id_imagen.");
        } catch (SQLException e) {
            throw new RuntimeException("Error guardando imagen_solicitud.", e);
        }
    }

    public List<ImagenSolicitud> listarPorLote(Long idLote) {
        String sql = "SELECT * FROM imagen_solicitud WHERE id_lote = ?";
        List<ImagenSolicitud> imagenes = new ArrayList<>();

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setLong(1, idLote);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    imagenes.add(mapear(rs));
                }
            }

            return imagenes;
        } catch (SQLException e) {
            throw new RuntimeException("Error listando imágenes del lote.", e);
        }
    }

    public void asignarNodo(Long idImagen, Long idNodo, String estado) {
        String sql = """
                UPDATE imagen_solicitud
                SET id_nodo = ?, estado = ?
                WHERE id_imagen = ?
                """;

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setLong(1, idNodo);
            ps.setString(2, estado);
            ps.setLong(3, idImagen);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error asignando nodo a imagen.", e);
        }
    }

    private ImagenSolicitud mapear(ResultSet rs) throws SQLException {
        ImagenSolicitud imagen = new ImagenSolicitud();
        imagen.setIdImagen(rs.getLong("id_imagen"));
        imagen.setIdLote(rs.getLong("id_lote"));
        imagen.setNombreArchivo(rs.getString("nombre_archivo"));
        imagen.setRutaOriginal(rs.getString("ruta_original"));
        imagen.setRutaResultado(rs.getString("ruta_resultado"));
        imagen.setFormatoEntrada(rs.getString("formato_entrada"));
        imagen.setFormatoSalida(rs.getString("formato_salida"));
        imagen.setEstado(rs.getString("estado"));
        imagen.setFechaRecepcion(rs.getTimestamp("fecha_recepcion").toLocalDateTime());

        Timestamp fechaProc = rs.getTimestamp("fecha_procesamiento");
        if (fechaProc != null) {
            imagen.setFechaProcesamiento(fechaProc.toLocalDateTime());
        }

        imagen.setTiempoEjecucion(rs.getBigDecimal("tiempo_ejecucion"));

        long idNodo = rs.getLong("id_nodo");
        if (!rs.wasNull()) {
            imagen.setIdNodo(idNodo);
        }

        return imagen;
    }
}