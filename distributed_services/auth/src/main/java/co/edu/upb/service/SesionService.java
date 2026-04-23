package co.edu.upb.service;

import java.time.LocalDateTime;

import co.edu.upb.config.AppConfig;
import co.edu.upb.entity.Sesion;
import co.edu.upb.repository.SesionRepository;

public class SesionService {

    private final SesionRepository sesionRepository;

    public SesionService() {
        this.sesionRepository = new SesionRepository();
    }

    public void crearSesion(Long idUsuario, String token) {
        Sesion sesion = new Sesion();
        sesion.setIdUsuario(idUsuario);
        sesion.setToken(token);
        sesion.setFechaCreacion(LocalDateTime.now());
        sesion.setFechaExpiracion(LocalDateTime.now().plusMinutes(AppConfig.getInt("jwt.expiration.minutes")));
        sesion.setEstado("ACTIVA");

        sesionRepository.guardar(sesion);
    }

    public boolean sesionActiva(String token) {
        Sesion sesion = sesionRepository.buscarPorToken(token);

        if (sesion == null) {
            return false;
        }

        if (!"ACTIVA".equalsIgnoreCase(sesion.getEstado())) {
            return false;
        }

        return sesion.getFechaExpiracion().isAfter(LocalDateTime.now());
    }

    public void cerrarSesion(String token) {
        sesionRepository.cerrarSesion(token);
    }

    public void cerrarSesionesUsuario(Long idUsuario) {
        sesionRepository.cerrarSesionesUsuario(idUsuario);
    }
}
