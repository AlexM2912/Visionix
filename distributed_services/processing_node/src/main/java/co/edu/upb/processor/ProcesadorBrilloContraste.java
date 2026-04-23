package co.edu.upb.processor;

import java.awt.Color;
import java.awt.image.BufferedImage;

public class ProcesadorBrilloContraste implements ProcesadorImagen {

    @Override
    public BufferedImage procesar(BufferedImage imagen, String valor) {
        int brillo = 0;
        double contraste = 1.0;

        if (valor != null && !valor.isBlank()) {
            String[] partes = valor.split(",");
            try {
                if (partes.length > 0) {
                    brillo = Integer.parseInt(partes[0].trim());
                }
                if (partes.length > 1) {
                    contraste = Double.parseDouble(partes[1].trim());
                }
            } 
            // Si el formato es incorrecto, se lanzará una excepción que será capturada aquí

            catch (NumberFormatException e) {
                throw new IllegalArgumentException("Formato inválido para BRILLO_CONTRASTE. Use brillo,contraste");
            }
        }

        int ancho = imagen.getWidth();
        int alto = imagen.getHeight();
        BufferedImage salida = new BufferedImage(ancho, alto, imagen.getType());

        for (int y = 0; y < alto; y++) {
            for (int x = 0; x < ancho; x++) {
                Color color = new Color(imagen.getRGB(x, y));

                int r = ajustar(color.getRed(), brillo, contraste);
                int g = ajustar(color.getGreen(), brillo, contraste);
                int b = ajustar(color.getBlue(), brillo, contraste);

                salida.setRGB(x, y, new Color(r, g, b).getRGB());
            }
        }

        return salida;
    }

    private int ajustar(int valorOriginal, int brillo, double contraste) {
        int ajustado = (int) (((valorOriginal - 128) * contraste) + 128 + brillo);
        return Math.max(0, Math.min(255, ajustado));
    }
}