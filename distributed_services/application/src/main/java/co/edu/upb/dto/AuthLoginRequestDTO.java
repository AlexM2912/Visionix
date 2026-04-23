package co.edu.upb.dto;

public class AuthLoginRequestDTO {

    private String correo;
    private String password;

    public AuthLoginRequestDTO() {
    }

    public AuthLoginRequestDTO(String correo, String password) {
        this.correo = correo;
        this.password = password;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}