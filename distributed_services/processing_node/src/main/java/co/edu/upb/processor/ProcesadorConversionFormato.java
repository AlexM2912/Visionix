package co.edu.upb.processor;

import java.awt.image.BufferedImage;

public class ProcesadorConversionFormato implements ProcesadorImagen {

    @Override
    public BufferedImage procesar(BufferedImage imagen, String valor) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException("La transformación CONVERSION_FORMATO requiere un valor como JPG, PNG o TIF.");
        }

        String formato = valor.trim().toUpperCase();

        if (!formato.equals("JPG") && !formato.equals("JPEG") && !formato.equals("PNG") && !formato.equals("TIF") && !formato.equals("TIFF")) {
            throw new IllegalArgumentException("Formato no soportado: " + valor);
        }

        return imagen;
    }
}