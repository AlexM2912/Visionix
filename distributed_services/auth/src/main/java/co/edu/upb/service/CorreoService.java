package co.edu.upb.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

import co.edu.upb.config.AppConfig;

public class CorreoService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public CorreoService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public void enviarCodigo(String correoDestino, String codigo, String tipo) {
        try {
            String apiKey = System.getenv("BREVO_API_KEY");

            if (apiKey == null || apiKey.isBlank()) {
                throw new RuntimeException("BREVO_API_KEY no está configurada en Railway");
            }

            String from = AppConfig.get("mail.from");

            if (from == null || from.isBlank()) {
                throw new RuntimeException("mail.from no está configurado");
            }

            String asunto = "Código de verificación - Visionix";

            String contenido = """
                    Hola,

                    Tu código para %s es: %s

                    Este código expira en 10 minutos.

                    Visionix
                    """.formatted(tipo, codigo);

            Map<String, Object> sender = new HashMap<>();
            sender.put("email", from);
            sender.put("name", "Visionix");

            Map<String, Object> destinatario = new HashMap<>();
            destinatario.put("email", correoDestino);

            Map<String, Object> payload = new HashMap<>();
            payload.put("sender", sender);
            payload.put("to", new Object[]{destinatario});
            payload.put("subject", asunto);
            payload.put("textContent", contenido);

            String json = objectMapper.writeValueAsString(payload);

            System.out.println("ENVIANDO CORREO BREVO A: " + correoDestino);
            System.out.println("BODY BREVO: " + json);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .timeout(Duration.ofSeconds(20))
                    .header("api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            System.out.println("STATUS BREVO: " + response.statusCode());
            System.out.println("RESPUESTA BREVO: " + response.body());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RuntimeException("Error enviando correo con BREVO. Código: "
                        + response.statusCode() + ". Respuesta: " + response.body());
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error enviando correo: " + e.getMessage(), e);
        }
    }
}