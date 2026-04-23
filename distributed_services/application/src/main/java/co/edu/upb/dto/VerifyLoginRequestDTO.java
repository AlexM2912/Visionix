package co.edu.upb.dto;

public class VerifyLoginRequestDTO {

    private String email;
    private String codigo;

    public VerifyLoginRequestDTO() {
    }

    public VerifyLoginRequestDTO(String email, String codigo) {
        this.email = email;
        this.codigo = codigo;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }
}