package co.edu.upb.service;

import java.util.Properties;

import co.edu.upb.config.AppConfig;
import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

public class CorreoService {

    public void enviarCodigo(String correoDestino, String codigo, String tipo) {
        String host = AppConfig.get("mail.host");
        String port = AppConfig.get("mail.port");
        String username = AppConfig.get("mail.username");
        String password = AppConfig.get("mail.password");
        String from = AppConfig.get("mail.from");

        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", host);
        props.put("mail.smtp.port", port);

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        });

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(from));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(correoDestino));
            message.setSubject("Código de verificación - Visionix");

            String contenido = """
                    Hola,

                    Tu código para %s es: %s

                    Este código expira en 10 minutos.

                    Visionix
                    """.formatted(tipo, codigo);

            message.setText(contenido);

            Transport.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error enviando correo.", e);
        }
    }
}