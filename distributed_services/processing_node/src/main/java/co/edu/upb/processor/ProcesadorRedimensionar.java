package co.edu.upb.processor;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;

public class ProcesadorRedimensionar implements ProcesadorImagen {

    @Override
    public BufferedImage procesar(BufferedImage imagen, String valor) {
        int nuevoAncho = imagen.getWidth() / 2;
        int nuevoAlto = imagen.getHeight() / 2;

        if (valor != null && !valor.isBlank() && valor.contains("x")) {
            String[] partes = valor.toLowerCase().split("x");
            try {
                nuevoAncho = Integer.parseInt(partes[0].trim());
                nuevoAlto = Integer.parseInt(partes[1].trim());
            } catch (Exception ignored) {
            }
        }

        BufferedImage salida = new BufferedImage(nuevoAncho, nuevoAlto, imagen.getType());
        Graphics2D g2d = salida.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.drawImage(imagen, 0, 0, nuevoAncho, nuevoAlto, null);
        g2d.dispose();

        return salida;
    }
}