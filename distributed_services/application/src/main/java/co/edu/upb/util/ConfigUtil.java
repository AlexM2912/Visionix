package co.edu.upb.util;

import java.io.InputStream;
import java.util.Properties;

public class ConfigUtil {

    private static final Properties properties = new Properties();

    static {
        try (InputStream input = ConfigUtil.class.getClassLoader().getResourceAsStream("application.properties")) {
            if (input == null) {
                throw new RuntimeException("No se encontró application.properties");
            }
            properties.load(input);
        } catch (Exception e) {
            throw new RuntimeException("Error cargando application.properties", e);
        }
    }

    public static String get(String key) {
        String value = properties.getProperty(key);
        if (value == null) {
            throw new RuntimeException("No se encontró la propiedad: " + key);
        }
        return value;
    }
}