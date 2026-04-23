package co.edu.upb.dto;

public class ResetPasswordRequestDTO {

    private String email;
    private String codigo;
    private String newPassword;

    public ResetPasswordRequestDTO() {
    }

    public ResetPasswordRequestDTO(String email, String codigo, String newPassword) {
        this.email = email;
        this.codigo = codigo;
        this.newPassword = newPassword;
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

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
