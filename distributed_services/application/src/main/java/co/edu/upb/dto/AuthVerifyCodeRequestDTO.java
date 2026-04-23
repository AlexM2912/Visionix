package co.edu.upb.dto;

public class AuthVerifyCodeRequestDTO {

    private String correo;
    private String codigo;

    public AuthVerifyCodeRequestDTO() {
    }

    public AuthVerifyCodeRequestDTO(String correo, String codigo) {
        this.correo = correo;
        this.codigo = codigo;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }
}