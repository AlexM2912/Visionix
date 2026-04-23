package co.edu.upb.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import co.edu.upb.config.DatabaseConfig;
import co.edu.upb.entity.NodoTrabajador;

public class NodoTrabajadorRepository {

    public NodoTrabajador buscarPorNombre(String nombre) {
        String sql = "SELECT * FROM nodo_trabajador WHERE nombre = ?";

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, nombre);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapear(rs);
                }
            }

            return null;
        } catch (SQLException e) {
            throw new RuntimeException("Error buscando nodo.", e);
        }
    }

    public void actualizarCarga(Long idNodo, int cargaActual, String estado) {
        String sql = """
                UPDATE nodo_trabajador
                SET carga_actual = ?, estado = ?
                WHERE id_nodo = ?
                """;

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, cargaActual);
            ps.setString(2, estado);
            ps.setLong(3, idNodo);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error actualizando carga del nodo.", e);
        }
    }

    private NodoTrabajador mapear(ResultSet rs) throws SQLException {
        NodoTrabajador nodo = new NodoTrabajador();
        nodo.setIdNodo(rs.getLong("id_nodo"));
        nodo.setNombre(rs.getString("nombre"));
        nodo.setDireccionRed(rs.getString("direccion_red"));
        nodo.setPuerto(rs.getInt("puerto"));
        nodo.setEstado(rs.getString("estado"));
        nodo.setCargaActual(rs.getInt("carga_actual"));
        nodo.setCapacidadMaxima(rs.getInt("capacidad_maxima"));
        nodo.setFechaRegistro(rs.getTimestamp("fecha_registro").toLocalDateTime());
        return nodo;
    }
}