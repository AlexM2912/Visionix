package co.edu.upb.service;

import java.time.LocalDateTime;

import co.edu.upb.config.AppConfig;
import co.edu.upb.entity.CodigoVerificacion;
import co.edu.upb.repository.CodigoVerificacionRepository;
import co.edu.upb.util.CodigoUtil;

public class CodigoService {

    private final CodigoVerificacionRepository codigoRepository;
    private final CorreoService correoService;

    public CodigoService() {
        this.codigoRepository = new CodigoVerificacionRepository();
        this.correoService = new CorreoService();
    }

    public void generarYEnviarCodigo(Long idUsuario, String email, String tipo) {
        String codigoGenerado = CodigoUtil.generarCodigo6Digitos();

        CodigoVerificacion codigo = new CodigoVerificacion();
        codigo.setIdUsuario(idUsuario);
        codigo.setCodigo(codigoGenerado);
        codigo.setTipo(tipo);
        codigo.setFechaCreacion(LocalDateTime.now());
        codigo.setFechaExpiracion(LocalDateTime.now().plusMinutes(AppConfig.getInt("verification.code.expiration.minutes")));
        codigo.setUsado(false);

        codigoRepository.guardar(codigo);
        correoService.enviarCodigo(email, codigoGenerado, tipo);
    }

    public boolean validarCodigo(Long idUsuario, String codigoIngresado, String tipo) {
        CodigoVerificacion codigo = codigoRepository.buscarCodigoVigente(idUsuario, codigoIngresado, tipo);

        if (codigo == null) {
            return false;
        }

        if (codigo.isUsado()) {
            return false;
        }

        if (codigo.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            return false;
        }

        codigoRepository.marcarComoUsado(codigo.getIdCodigo());
        return true;
    }
}