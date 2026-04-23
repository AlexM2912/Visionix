package co.edu.upb.processor;

import java.awt.Color;
import java.awt.image.BufferedImage;

public class ProcesadorPerfilar implements ProcesadorImagen {

    @Override
    public BufferedImage procesar(BufferedImage imagen, String valor) {
        int ancho = imagen.getWidth();
        int alto = imagen.getHeight();

        BufferedImage salida = new BufferedImage(ancho, alto, imagen.getType());

        int[][] kernel = {
            { 0, -1,  0 },
            { -1,  5, -1 },
            { 0, -1,  0 }
        };

        for (int y = 1; y < alto - 1; y++) {
            for (int x = 1; x < ancho - 1; x++) {
                int sumaR = 0;
                int sumaG = 0;
                int sumaB = 0;

                for (int ky = -1; ky <= 1; ky++) {
                    for (int kx = -1; kx <= 1; kx++) {
                        Color color = new Color(imagen.getRGB(x + kx, y + ky));
                        int factor = kernel[ky + 1][kx + 1];

                        sumaR += color.getRed() * factor;
                        sumaG += color.getGreen() * factor;
                        sumaB += color.getBlue() * factor;
                    }
                }

                int r = Math.max(0, Math.min(255, sumaR));
                int g = Math.max(0, Math.min(255, sumaG));
                int b = Math.max(0, Math.min(255, sumaB));

                salida.setRGB(x, y, new Color(r, g, b).getRGB());
            }
        }

        for (int x = 0; x < ancho; x++) {
            salida.setRGB(x, 0, imagen.getRGB(x, 0));
            salida.setRGB(x, alto - 1, imagen.getRGB(x, alto - 1));
        }

        for (int y = 0; y < alto; y++) {
            salida.setRGB(0, y, imagen.getRGB(0, y));
            salida.setRGB(ancho - 1, y, imagen.getRGB(ancho - 1, y));
        }

        return salida;
    }
}