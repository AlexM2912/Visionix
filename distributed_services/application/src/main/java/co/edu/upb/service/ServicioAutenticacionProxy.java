package co.edu.upb.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import com.fasterxml.jackson.databind.ObjectMapper;

import co.edu.upb.dto.AuthResponseDTO;
import co.edu.upb.dto.ForgotPasswordRequestDTO;
import co.edu.upb.dto.LoginRequestDTO;
import co.edu.upb.dto.ResetPasswordRequestDTO;
import co.edu.upb.dto.SignupRequestDTO;
import co.edu.upb.dto.ValidateTokenResponseDTO;
import co.edu.upb.dto.VerifyLoginRequestDTO;
import co.edu.upb.dto.VerifySignupRequestDTO;
import co.edu.upb.util.ConfigUtil;

public class ServicioAutenticacionProxy {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String authBaseUrl;

    public ServicioAutenticacionProxy() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
        this.authBaseUrl = ConfigUtil.get("auth.base.url");
    }

    public AuthResponseDTO signup(SignupRequestDTO requestDto) {
        return post("/auth/signup", requestDto, AuthResponseDTO.class);
    }

    public AuthResponseDTO verifySignup(VerifySignupRequestDTO requestDto) {
        return post("/auth/verify-signup", requestDto, AuthResponseDTO.class);
    }

    public AuthResponseDTO login(LoginRequestDTO requestDto) {
        return post("/auth/login", requestDto, AuthResponseDTO.class);
    }

    public AuthResponseDTO forgotPassword(ForgotPasswordRequestDTO requestDto) {
        return post("/auth/forgot-password", requestDto, AuthResponseDTO.class);
    }

    public AuthResponseDTO resetPassword(ResetPasswordRequestDTO requestDto) {
        return post("/auth/reset-password", requestDto, AuthResponseDTO.class);
    }

    public AuthResponseDTO verifyLogin(VerifyLoginRequestDTO requestDto) {
        return post("/auth/verify-login", requestDto, AuthResponseDTO.class);
    }

    public ValidateTokenResponseDTO validarToken(String token) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(authBaseUrl + "/auth/validate"))
                    .timeout(Duration.ofSeconds(15))
                    .header("Authorization", "Bearer " + token)
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            String responseBody = response.body();

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return objectMapper.readValue(responseBody, ValidateTokenResponseDTO.class);
            }

            ValidateTokenResponseDTO error = new ValidateTokenResponseDTO();
            error.setValido(false);
            error.setMensaje("Error HTTP desde auth. Código: " + response.statusCode() + ". Respuesta: " + responseBody);
            return error;

        } catch (Exception e) {
            ValidateTokenResponseDTO error = new ValidateTokenResponseDTO();
            error.setValido(false);
            error.setMensaje("Error consumiendo auth: " + e.getMessage());
            return error;
        }
    }

    public AuthResponseDTO logout(String token) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(authBaseUrl + "/auth/logout"))
                    .timeout(Duration.ofSeconds(15))
                    .header("Authorization", "Bearer " + token)
                    .POST(HttpRequest.BodyPublishers.noBody())
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            String responseBody = response.body();

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return objectMapper.readValue(responseBody, AuthResponseDTO.class);
            }

            AuthResponseDTO error = new AuthResponseDTO();
            error.setOk(false);
            error.setMensaje("Error HTTP desde auth. Código: " + response.statusCode() + ". Respuesta: " + responseBody);
            return error;

        } catch (Exception e) {
            AuthResponseDTO error = new AuthResponseDTO();
            error.setOk(false);
            error.setMensaje("Error consumiendo auth: " + e.getMessage());
            return error;
        }
    }

    private <T> T post(String endpoint, Object body, Class<T> responseClass) {
        try {
            String jsonRequest = objectMapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(authBaseUrl + endpoint))
                    .timeout(Duration.ofSeconds(15))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonRequest))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            String responseBody = response.body();

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return objectMapper.readValue(responseBody, responseClass);
            }

            if (responseClass.equals(AuthResponseDTO.class) && responseBody != null && !responseBody.isBlank()) {
                return responseClass.cast(objectMapper.readValue(responseBody, AuthResponseDTO.class));
            }

            throw new RuntimeException("Error HTTP desde auth. Código: " + response.statusCode() + ". Respuesta: " + responseBody);

        } catch (Exception e) {
            throw new RuntimeException("Error consumiendo endpoint " + endpoint + ": " + e.getMessage(), e);
        }
    }
}
