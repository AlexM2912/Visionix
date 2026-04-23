package co.edu.upb.dto;

public class TransformacionDTO {

    private String tipo;
    private String valor;

    public TransformacionDTO() {
    }

    public TransformacionDTO(String tipo, String valor) {
        this.tipo = tipo;
        this.valor = valor;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getValor() {
        return valor;
    }

    public void setValor(String valor) {
        this.valor = valor;
    }
}