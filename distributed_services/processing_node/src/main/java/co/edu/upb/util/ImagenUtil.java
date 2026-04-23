package co.edu.upb.util;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

public class ImagenUtil {

    public BufferedImage leerImagen(String ruta) {
        try {
            return ImageIO.read(new File(ruta));
        } catch (IOException e) {
            throw new RuntimeException("Error leyendo imagen desde: " + ruta, e);
        }
    }

    public void guardarImagen(BufferedImage imagen, String formato, String ruta) {
        try {
            ImageIO.write(imagen, formato, new File(ruta));
        } catch (IOException e) {
            throw new RuntimeException("Error guardando imagen en: " + ruta, e);
        }
    }

    public String obtenerExtension(String nombreArchivo) {
        int indice = nombreArchivo.lastIndexOf('.');
        if (indice == -1) {
            return "jpg";
        }
        return nombreArchivo.substring(indice + 1).toLowerCase();
    }
}