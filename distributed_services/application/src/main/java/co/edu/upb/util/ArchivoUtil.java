package co.edu.upb.util;

public class ArchivoUtil {

    public static String obtenerExtension(String nombreArchivo) {
        if (nombreArchivo == null || nombreArchivo.isBlank()) {
            return null;
        }

        int indice = nombreArchivo.lastIndexOf('.');
        if (indice == -1) {
            return null;
        }

        return nombreArchivo.substring(indice + 1).toLowerCase();
    }
}