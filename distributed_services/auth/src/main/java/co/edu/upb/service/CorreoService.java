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
            String apiKey = AppConfig.get("resend.api.key");
            String from = AppConfig.get("mail.from");

            String asunto = "Código de verificación - Visionix";

            String contenido = """
                    Hola,

                    Tu código para %s es: %s

                    Este código expira en 10 minutos.

                    Visionix
                    """.formatted(tipo, codigo);

            Map<String, Object> payload = new HashMap<>();
            payload.put("from", from);
            payload.put("to", new String[]{correoDestino});
            payload.put("subject", asunto);
            payload.put("text", contenido);

            String json = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .timeout(Duration.ofSeconds(20))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            System.out.println("STATUS RESEND: " + response.statusCode());
            System.out.println("RESPUESTA RESEND: " + response.body());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RuntimeException("Error enviando correo con Resend. Código: "
                        + response.statusCode() + ". Respuesta: " + response.body());
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error enviando correo: " + e.getMessage(), e);
        }
    }
}