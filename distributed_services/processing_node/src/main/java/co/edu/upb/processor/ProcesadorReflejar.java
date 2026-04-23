package co.edu.upb.processor;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;

public class ProcesadorReflejar implements ProcesadorImagen {

    @Override
    public BufferedImage procesar(BufferedImage imagen, String valor) {
        int ancho = imagen.getWidth();
        int alto = imagen.getHeight();

        BufferedImage salida = new BufferedImage(ancho, alto, imagen.getType());
        Graphics2D g2d = salida.createGraphics();

        String modo = (valor == null || valor.isBlank()) ? "HORIZONTAL" : valor.toUpperCase();

        if ("VERTICAL".equals(modo)) {
            g2d.drawImage(imagen, 0, alto, ancho, -alto, null);
        } else {
            g2d.drawImage(imagen, ancho, 0, -ancho, alto, null);
        }

        g2d.dispose();
        return salida;
    }
}