package co.edu.upb.processor;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;

public class ProcesadorRotar implements ProcesadorImagen {

    @Override
    public BufferedImage procesar(BufferedImage imagen, String valor) {
        int ancho = imagen.getWidth();
        int alto = imagen.getHeight();

        BufferedImage salida = new BufferedImage(alto, ancho, imagen.getType());
        Graphics2D g2d = salida.createGraphics();

        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.translate((alto - ancho) / 2.0, (alto - ancho) / 2.0);
        g2d.rotate(Math.toRadians(90), alto / 2.0, ancho / 2.0);
        g2d.drawRenderedImage(imagen, null);
        g2d.dispose();

        return salida;
    }
}