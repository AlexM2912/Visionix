package co.edu.upb.almacenamiento;

import java.awt.image.BufferedImage;
import java.io.File;

import co.edu.upb.util.ImagenUtil;

public class GestorAlmacenamiento {

    private final ImagenUtil imagenUtil = new ImagenUtil();

    public String guardarResultado(BufferedImage imagen, String rutaBase, String nombreArchivoSalida) {
        File carpeta = new File(rutaBase);
        if (!carpeta.exists()) {
            carpeta.mkdirs();
        }

        String extension = imagenUtil.obtenerExtension(nombreArchivoSalida);
        String rutaCompleta = rutaBase + File.separator + nombreArchivoSalida;
        imagenUtil.guardarImagen(imagen, extension, rutaCompleta);

        return rutaCompleta;
    }
}