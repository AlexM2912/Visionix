package co.edu.upb.processor;

import java.awt.image.BufferedImage;

public interface ProcesadorImagen {
    BufferedImage procesar(BufferedImage imagen, String valor);
}