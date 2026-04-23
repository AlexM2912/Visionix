package co.edu.upb.processor;

import java.awt.image.BufferedImage;

public class ProcesadorRecortar implements ProcesadorImagen {

    @Override
    public BufferedImage procesar(BufferedImage imagen, String valor) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException("La transformación RECORTAR requiere el formato x,y,ancho,alto.");
        }

        String[] partes = valor.split(",");
        if (partes.length != 4) {
            throw new IllegalArgumentException("Formato inválido para RECORTAR. Use x,y,ancho,alto.");
        }

        int x = Integer.parseInt(partes[0].trim());
        int y = Integer.parseInt(partes[1].trim());
        int ancho = Integer.parseInt(partes[2].trim());
        int alto = Integer.parseInt(partes[3].trim());

        if (x < 0 || y < 0 || ancho <= 0 || alto <= 0) {
            throw new IllegalArgumentException("Los valores de recorte deben ser positivos.");
        }

        if (x + ancho > imagen.getWidth() || y + alto > imagen.getHeight()) {
            throw new IllegalArgumentException("El recorte excede los límites de la imagen.");
        }

        return imagen.getSubimage(x, y, ancho, alto);
    }
}