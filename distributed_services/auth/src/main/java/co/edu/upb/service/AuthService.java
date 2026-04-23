package co.edu.upb.service;

import java.time.LocalDateTime;

import co.edu.upb.dto.AuthResponseDTO;
import co.edu.upb.dto.ForgotPasswordRequestDTO;
import co.edu.upb.dto.LoginRequestDTO;
import co.edu.upb.dto.ResetPasswordRequestDTO;
import co.edu.upb.dto.SignupRequestDTO;
import co.edu.upb.dto.ValidateTokenResponseDTO;
import co.edu.upb.dto.VerifyLoginRequestDTO;
import co.edu.upb.dto.VerifySignupRequestDTO;
import co.edu.upb.entity.Usuario;
import co.edu.upb.repository.UsuarioRepository;
import co.edu.upb.util.PasswordUtil;

public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final CodigoService codigoService;
    private final TokenService tokenService;
    private final SesionService sesionService;

    public AuthService() {
        this.usuarioRepository = new UsuarioRepository();
        this.codigoService = new CodigoService();
        this.tokenService = new TokenService();
        this.sesionService = new SesionService();
    }

    public AuthResponseDTO signup(SignupRequestDTO request) {
        if (request.getNombre() == null || request.getNombre().isBlank()
                || request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Todos los campos son obligatorios.");
        }

        Usuario existente = usuarioRepository.buscarPorEmail(request.getEmail());
        if (existente != null) {
            throw new IllegalArgumentException("Ya existe un usuario con ese correo.");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPasswordHash(PasswordUtil.hashPassword(request.getPassword()));
        usuario.setRol("USER");
        usuario.setEstado("PENDIENTE_VERIFICACION");
        usuario.setFechaCreacion(LocalDateTime.now());

        Long idUsuario = usuarioRepository.guardar(usuario);
        codigoService.generarYEnviarCodigo(idUsuario, usuario.getEmail(), "REGISTRO");

        AuthResponseDTO response = new AuthResponseDTO();
        response.setOk(true);
        response.setMensaje("Usuario registrado. Se envió un código al correo.");
        return response;
    }

    public AuthResponseDTO verifySignup(VerifySignupRequestDTO request) {
        Usuario usuario = usuarioRepository.buscarPorEmail(request.getEmail());

        if (usuario == null) {
            throw new IllegalArgumentException("Usuario no encontrado.");
        }

        boolean codigoValido = codigoService.validarCodigo(
                usuario.getIdUsuario(),
                request.getCodigo(),
                "REGISTRO"
        );

        if (!codigoValido) {
            throw new IllegalArgumentException("Código inválido o expirado.");
        }

        usuarioRepository.activarUsuario(usuario.getIdUsuario());
        usuario.setEstado("ACTIVO");
        usuario.setFechaActivacion(LocalDateTime.now());

        String jwt = tokenService.generarToken(usuario);
        sesionService.crearSesion(usuario.getIdUsuario(), jwt);

        AuthResponseDTO response = new AuthResponseDTO();
        response.setOk(true);
        response.setMensaje("Cuenta verificada correctamente. Sesión iniciada.");
        response.setToken(jwt);
        response.setIdUsuario(usuario.getIdUsuario());
        response.setNombre(usuario.getNombre());
        response.setEmail(usuario.getEmail());
        response.setRol(usuario.getRol());
        return response;
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        Usuario usuario = usuarioRepository.buscarPorEmail(request.getEmail());

        if (usuario == null) {
            throw new IllegalArgumentException("Usuario no encontrado.");
        }

        if (!"ACTIVO".equalsIgnoreCase(usuario.getEstado())) {
            throw new IllegalArgumentException("La cuenta aún no está activa.");
        }

        boolean passwordOk = PasswordUtil.verificarPassword(request.getPassword(), usuario.getPasswordHash());

        if (!passwordOk) {
            throw new IllegalArgumentException("Contraseña incorrecta.");
        }

        codigoService.generarYEnviarCodigo(usuario.getIdUsuario(), usuario.getEmail(), "LOGIN");

        AuthResponseDTO response = new AuthResponseDTO();
        response.setOk(true);
        response.setMensaje("Código de acceso enviado al correo.");
        return response;
    }

    public AuthResponseDTO verifyLogin(VerifyLoginRequestDTO request) {
        Usuario usuario = usuarioRepository.buscarPorEmail(request.getEmail());

        if (usuario == null) {
            throw new IllegalArgumentException("Usuario no encontrado.");
        }

        boolean codigoValido = codigoService.validarCodigo(
                usuario.getIdUsuario(),
                request.getCodigo(),
                "LOGIN"
        );

        if (!codigoValido) {
            throw new IllegalArgumentException("Código inválido o expirado.");
        }

        String jwt = tokenService.generarToken(usuario);
        sesionService.crearSesion(usuario.getIdUsuario(), jwt);

        AuthResponseDTO response = new AuthResponseDTO();
        response.setOk(true);
        response.setMensaje("Inicio de sesión exitoso.");
        response.setToken(jwt);
        response.setIdUsuario(usuario.getIdUsuario());
        response.setNombre(usuario.getNombre());
        response.setEmail(usuario.getEmail());
        response.setRol(usuario.getRol());

        return response;
    }

    public AuthResponseDTO forgotPassword(ForgotPasswordRequestDTO request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("El correo es obligatorio.");
        }

        Usuario usuario = usuarioRepository.buscarPorEmail(request.getEmail());

        if (usuario == null) {
            throw new IllegalArgumentException("Usuario no encontrado.");
        }

        if (!"ACTIVO".equalsIgnoreCase(usuario.getEstado())) {
            throw new IllegalArgumentException("La cuenta aún no está activa.");
        }

        codigoService.generarYEnviarCodigo(usuario.getIdUsuario(), usuario.getEmail(), "RECUPERACION");

        AuthResponseDTO response = new AuthResponseDTO();
        response.setOk(true);
        response.setMensaje("Se envió un código de recuperación al correo.");
        return response;
    }

    public AuthResponseDTO resetPassword(ResetPasswordRequestDTO request) {
        if (request.getEmail() == null || request.getEmail().isBlank()
                || request.getCodigo() == null || request.getCodigo().isBlank()
                || request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new IllegalArgumentException("Todos los campos son obligatorios.");
        }

        if (request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("La nueva contraseña debe tener al menos 6 caracteres.");
        }

        Usuario usuario = usuarioRepository.buscarPorEmail(request.getEmail());

        if (usuario == null) {
            throw new IllegalArgumentException("Usuario no encontrado.");
        }

        boolean codigoValido = codigoService.validarCodigo(
                usuario.getIdUsuario(),
                request.getCodigo(),
                "RECUPERACION"
        );

        if (!codigoValido) {
            throw new IllegalArgumentException("Código inválido o expirado.");
        }

        usuarioRepository.actualizarPassword(
                usuario.getIdUsuario(),
                PasswordUtil.hashPassword(request.getNewPassword())
        );
        sesionService.cerrarSesionesUsuario(usuario.getIdUsuario());

        AuthResponseDTO response = new AuthResponseDTO();
        response.setOk(true);
        response.setMensaje("Contraseña actualizada correctamente. Ya puedes iniciar sesión.");
        return response;
    }

    public ValidateTokenResponseDTO validateToken(String token) {
        ValidateTokenResponseDTO validacion = tokenService.validarToken(token);

        if (!validacion.isValido()) {
            return validacion;
        }

        if (!sesionService.sesionActiva(token)) {
            validacion.setValido(false);
            validacion.setMensaje("La sesión no está activa o expiró.");
        }

        return validacion;
    }

    public AuthResponseDTO logout(String token) {
        sesionService.cerrarSesion(token);

        AuthResponseDTO response = new AuthResponseDTO();
        response.setOk(true);
        response.setMensaje("Sesión cerrada correctamente.");
        return response;
    }
}
