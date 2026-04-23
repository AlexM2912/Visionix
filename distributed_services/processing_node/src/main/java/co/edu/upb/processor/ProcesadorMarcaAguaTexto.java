package co.edu.upb.processor;

import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;

public class ProcesadorMarcaAguaTexto implements ProcesadorImagen {

    @Override
    public BufferedImage procesar(BufferedImage imagen, String valor) {
        String texto = (valor == null || valor.isBlank()) ? "UPB" : valor;

        BufferedImage salida = new BufferedImage(
                imagen.getWidth(),
                imagen.getHeight(),
                imagen.getType()
        );

        Graphics2D g2d = salida.createGraphics();
        g2d.drawImage(imagen, 0, 0, null);

        g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 0.35f));
        g2d.setColor(Color.WHITE);

        int tamanoFuente = Math.max(18, imagen.getWidth() / 15);
        g2d.setFont(new Font("Arial", Font.BOLD, tamanoFuente));

        int x = imagen.getWidth() - (texto.length() * tamanoFuente / 2) - 20;
        int y = imagen.getHeight() - 30;

        g2d.drawString(texto, Math.max(10, x), y);
        g2d.dispose();

        return salida;
    }
}