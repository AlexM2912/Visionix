package co.edu.upb.processor;

import java.awt.Color;
import java.awt.image.BufferedImage;

public class ProcesadorEscalaGrises implements ProcesadorImagen {

    @Override
    public BufferedImage procesar(BufferedImage imagen, String valor) {
        int ancho = imagen.getWidth();
        int alto = imagen.getHeight();

        BufferedImage salida = new BufferedImage(ancho, alto, BufferedImage.TYPE_INT_RGB);

        for (int y = 0; y < alto; y++) {
            for (int x = 0; x < ancho; x++) {
                Color color = new Color(imagen.getRGB(x, y));
                int gris = (color.getRed() + color.getGreen() + color.getBlue()) / 3;
                Color nuevo = new Color(gris, gris, gris);
                salida.setRGB(x, y, nuevo.getRGB());
            }
        }

        return salida;
    }
}