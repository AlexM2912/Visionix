package co.edu.upb.service;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import co.edu.upb.config.AppConfig;
import co.edu.upb.dto.ValidateTokenResponseDTO;
import co.edu.upb.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

public class TokenService {

    private final SecretKey secretKey;

    public TokenService() {
        this.secretKey = Keys.hmacShaKeyFor(
                AppConfig.get("jwt.secret").getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generarToken(Usuario usuario) {
        long expirationMillis = AppConfig.getInt("jwt.expiration.minutes") * 60L * 1000L;
        Date now = new Date();
        Date expiration = new Date(now.getTime() + expirationMillis);

        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("id_usuario", usuario.getIdUsuario())
                .claim("rol", usuario.getRol())
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();
    }

    public ValidateTokenResponseDTO validarToken(String token) {
        ValidateTokenResponseDTO response = new ValidateTokenResponseDTO();

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            response.setValido(true);
            response.setMensaje("Token válido");
            response.setIdUsuario(Long.valueOf(String.valueOf(claims.get("id_usuario"))));
            response.setEmail(claims.getSubject());
            response.setRol(String.valueOf(claims.get("rol")));

            return response;
        } catch (Exception e) {
            response.setValido(false);
            response.setMensaje("Token inválido o expirado");
            return response;
        }
    }
}