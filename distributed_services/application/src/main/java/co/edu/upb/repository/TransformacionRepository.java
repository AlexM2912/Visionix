package co.edu.upb.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import co.edu.upb.config.DatabaseConfig;
import co.edu.upb.entity.Transformacion;

public class TransformacionRepository {

    public void guardar(Transformacion transformacion) {
        String sql = """
                INSERT INTO transformacion (id_imagen, tipo, orden_transformacion, parametros)
                VALUES (?, ?, ?, ?)
                """;

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setLong(1, transformacion.getIdImagen());
            ps.setString(2, transformacion.getTipo());
            ps.setInt(3, transformacion.getOrdenTransformacion());
            ps.setString(4, transformacion.getParametros());

            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error guardando transformación.", e);
        }
    }
}