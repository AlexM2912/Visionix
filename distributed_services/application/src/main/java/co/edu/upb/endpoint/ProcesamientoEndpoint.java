package co.edu.upb.endpoint;

import co.edu.upb.dto.AuthResponseDTO;
import co.edu.upb.dto.ForgotPasswordRequestDTO;
import co.edu.upb.dto.LoginRequestDTO;
import co.edu.upb.dto.ResetPasswordRequestDTO;
import co.edu.upb.dto.SignupRequestDTO;
import co.edu.upb.dto.SolicitudLoteDTO;
import co.edu.upb.dto.ValidateTokenResponseDTO;
import co.edu.upb.dto.VerifyLoginRequestDTO;
import co.edu.upb.dto.VerifySignupRequestDTO;
import co.edu.upb.service.LoteService;
import co.edu.upb.service.ServicioAutenticacionProxy;
import jakarta.jws.WebMethod;
import jakarta.jws.WebParam;
import jakarta.jws.WebService;

@WebService
public class ProcesamientoEndpoint {

    private final LoteService loteService = new LoteService();
    private final ServicioAutenticacionProxy servicioAutenticacionProxy = new ServicioAutenticacionProxy();

    @WebMethod
    public AuthResponseDTO signup(
            @WebParam(name = "request") SignupRequestDTO request) {
        return servicioAutenticacionProxy.signup(request);
    }

    @WebMethod
    public AuthResponseDTO verifySignup(
            @WebParam(name = "request") VerifySignupRequestDTO request) {
        return servicioAutenticacionProxy.verifySignup(request);
    }

    @WebMethod
    public AuthResponseDTO login(
            @WebParam(name = "request") LoginRequestDTO request) {
        return servicioAutenticacionProxy.login(request);
    }

    @WebMethod
    public AuthResponseDTO forgotPassword(
            @WebParam(name = "request") ForgotPasswordRequestDTO request) {
        return servicioAutenticacionProxy.forgotPassword(request);
    }

    @WebMethod
    public AuthResponseDTO resetPassword(
            @WebParam(name = "request") ResetPasswordRequestDTO request) {
        return servicioAutenticacionProxy.resetPassword(request);
    }

    @WebMethod
    public AuthResponseDTO verifyLogin(
            @WebParam(name = "request") VerifyLoginRequestDTO request) {
        return servicioAutenticacionProxy.verifyLogin(request);
    }

    @WebMethod
    public ValidateTokenResponseDTO validarToken(
            @WebParam(name = "token") String token) {
        return servicioAutenticacionProxy.validarToken(token);
    }

    @WebMethod
    public AuthResponseDTO logout(
            @WebParam(name = "token") String token) {
        return servicioAutenticacionProxy.logout(token);
    }

    @WebMethod
    public SolicitudLoteDTO crearSolicitudLote(
            @WebParam(name = "token") String token,
            @WebParam(name = "idUsuario") Long idUsuario,
            @WebParam(name = "solicitudLoteDTO") SolicitudLoteDTO solicitudLoteDTO) {

        ValidateTokenResponseDTO validacion = servicioAutenticacionProxy.validarToken(token);

        if (!validacion.isValido()) {
            SolicitudLoteDTO error = new SolicitudLoteDTO();
            error.setEstado("ERROR");
            error.setMensaje("Token inválido o expirado.");
            return error;
        }

        if (!idUsuario.equals(validacion.getIdUsuario())) {
            SolicitudLoteDTO error = new SolicitudLoteDTO();
            error.setEstado("ERROR");
            error.setMensaje("El usuario autenticado no coincide con el idUsuario enviado.");
            return error;
        }

        return loteService.crearSolicitudLote(idUsuario, solicitudLoteDTO);
    }

    @WebMethod
    public SolicitudLoteDTO consultarEstadoSolicitud(
            @WebParam(name = "token") String token,
            @WebParam(name = "idLote") Long idLote) {

        ValidateTokenResponseDTO validacion = servicioAutenticacionProxy.validarToken(token);

        if (!validacion.isValido()) {
            SolicitudLoteDTO error = new SolicitudLoteDTO();
            error.setEstado("ERROR");
            error.setMensaje("Token inválido o expirado.");
            return error;
        }

        return loteService.consultarEstadoSolicitud(idLote);
    }
}
