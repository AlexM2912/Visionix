package co.edu.upb.controller;

import com.fasterxml.jackson.databind.ObjectMapper;

import co.edu.upb.dto.AuthResponseDTO;
import co.edu.upb.dto.ForgotPasswordRequestDTO;
import co.edu.upb.dto.LoginRequestDTO;
import co.edu.upb.dto.ResetPasswordRequestDTO;
import co.edu.upb.dto.SignupRequestDTO;
import co.edu.upb.dto.ValidateTokenResponseDTO;
import co.edu.upb.dto.VerifyLoginRequestDTO;
import co.edu.upb.dto.VerifySignupRequestDTO;
import co.edu.upb.service.AuthService;
import static spark.Spark.get;
import static spark.Spark.path;
import static spark.Spark.post;

public class AuthController {

    private final AuthService authService;
    private final ObjectMapper objectMapper;

    public AuthController() {
        this.authService = new AuthService();
        this.objectMapper = new ObjectMapper();
    }

    public void registrarRutas() {
        path("/auth", () -> {

            post("/signup", (req, res) -> {
                res.type("application/json");
                try {
                    SignupRequestDTO dto = objectMapper.readValue(req.body(), SignupRequestDTO.class);
                    AuthResponseDTO response = authService.signup(dto);
                    res.status(201);
                    return objectMapper.writeValueAsString(response);
                } catch (Exception e) {
                    res.status(400);
                    return errorJson(e.getMessage());
                }
            });

            post("/verify-signup", (req, res) -> {
                res.type("application/json");
                try {
                    VerifySignupRequestDTO dto = objectMapper.readValue(req.body(), VerifySignupRequestDTO.class);
                    AuthResponseDTO response = authService.verifySignup(dto);
                    return objectMapper.writeValueAsString(response);
                } catch (Exception e) {
                    res.status(400);
                    return errorJson(e.getMessage());
                }
            });

            post("/login", (req, res) -> {
                res.type("application/json");
                try {
                    LoginRequestDTO dto = objectMapper.readValue(req.body(), LoginRequestDTO.class);
                    AuthResponseDTO response = authService.login(dto);
                    return objectMapper.writeValueAsString(response);
                } catch (Exception e) {
                    res.status(400);
                    return errorJson(e.getMessage());
                }
            });

            post("/forgot-password", (req, res) -> {
                res.type("application/json");
                try {
                    ForgotPasswordRequestDTO dto = objectMapper.readValue(req.body(), ForgotPasswordRequestDTO.class);
                    AuthResponseDTO response = authService.forgotPassword(dto);
                    return objectMapper.writeValueAsString(response);
                } catch (Exception e) {
                    res.status(400);
                    return errorJson(e.getMessage());
                }
            });

            post("/reset-password", (req, res) -> {
                res.type("application/json");
                try {
                    ResetPasswordRequestDTO dto = objectMapper.readValue(req.body(), ResetPasswordRequestDTO.class);
                    AuthResponseDTO response = authService.resetPassword(dto);
                    return objectMapper.writeValueAsString(response);
                } catch (Exception e) {
                    res.status(400);
                    return errorJson(e.getMessage());
                }
            });

            post("/verify-login", (req, res) -> {
                res.type("application/json");
                try {
                    VerifyLoginRequestDTO dto = objectMapper.readValue(req.body(), VerifyLoginRequestDTO.class);
                    AuthResponseDTO response = authService.verifyLogin(dto);
                    return objectMapper.writeValueAsString(response);
                } catch (Exception e) {
                    res.status(400);
                    return errorJson(e.getMessage());
                }
            });

            get("/validate", (req, res) -> {
                res.type("application/json");
                try {
                    String token = req.headers("Authorization");

                    if (token == null || token.isBlank()) {
                        res.status(401);
                        return errorJson("Falta el token en Authorization.");
                    }

                    if (token.startsWith("Bearer ")) {
                        token = token.substring(7);
                    }

                    ValidateTokenResponseDTO response = authService.validateToken(token);
                    return objectMapper.writeValueAsString(response);
                } catch (Exception e) {
                    res.status(400);
                    return errorJson(e.getMessage());
                }
            });

            post("/logout", (req, res) -> {
                res.type("application/json");
                try {
                    String token = req.headers("Authorization");

                    if (token == null || token.isBlank()) {
                        res.status(401);
                        return errorJson("Falta el token en Authorization.");
                    }

                    if (token.startsWith("Bearer ")) {
                        token = token.substring(7);
                    }

                    AuthResponseDTO response = authService.logout(token);
                    return objectMapper.writeValueAsString(response);
                } catch (Exception e) {
                    res.status(400);
                    return errorJson(e.getMessage());
                }
            });
        });
    }

    private String errorJson(String mensaje) {
        return "{\"ok\":false,\"mensaje\":\"" + mensaje.replace("\"", "'") + "\"}";
    }
}
