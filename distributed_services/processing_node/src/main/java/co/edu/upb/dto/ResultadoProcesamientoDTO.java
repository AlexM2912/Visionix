package co.edu.upb.dto;

public class ResultadoProcesamientoDTO {

    private Long idImagen;
    private String idNodo;
    private String estado;
    private String mensaje;
    private String rutaResultado;
    private long tiempoProcesamientoMs;

    public Long getIdImagen() {
        return idImagen;
    }

    public void setIdImagen(Long idImagen) {
        this.idImagen = idImagen;
    }

    public String getIdNodo() {
        return idNodo;
    }

    public void setIdNodo(String idNodo) {
        this.idNodo = idNodo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getRutaResultado() {
        return rutaResultado;
    }

    public void setRutaResultado(String rutaResultado) {
        this.rutaResultado = rutaResultado;
    }

    public long getTiempoProcesamientoMs() {
        return tiempoProcesamientoMs;
    }

    public void setTiempoProcesamientoMs(long tiempoProcesamientoMs) {
        this.tiempoProcesamientoMs = tiempoProcesamientoMs;
    }
}