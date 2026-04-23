package co.edu.upb.util;

public class FechaUtil {
    public static String ahora() {
        return java.time.LocalDateTime.now().toString();
    }
}