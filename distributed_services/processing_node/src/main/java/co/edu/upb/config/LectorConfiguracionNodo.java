package co.edu.upb.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class LectorConfiguracionNodo {

    public ConfiguracionNodo cargar(String archivoProperties) {
        Properties properties = new Properties();

        try (InputStream input = getClass().getClassLoader().getResourceAsStream(archivoProperties)) {
            if (input == null) {
                throw new IllegalArgumentException("No se encontró el archivo de configuración: " + archivoProperties);
            }

            properties.load(input);

            ConfiguracionNodo configuracion = new ConfiguracionNodo();
            configuracion.setIdNodo(properties.getProperty("nodo.id"));
            configuracion.setPuerto(Integer.parseInt(properties.getProperty("nodo.puerto")));
            configuracion.setCantidadHilos(Integer.parseInt(properties.getProperty("nodo.hilos")));
            configuracion.setCapacidadMaxima(Integer.parseInt(properties.getProperty("nodo.capacidadMaxima")));
            configuracion.setRutaAlmacenamiento(properties.getProperty("nodo.rutaAlmacenamiento"));

            return configuracion;
        } catch (IOException e) {
            throw new RuntimeException("Error leyendo configuración del nodo.", e);
        }
    }
}