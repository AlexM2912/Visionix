package co.edu.upb.dto;

import java.util.ArrayList;
import java.util.List;

public class SolicitudLoteDTO {

    private Long id;
    private Long idUsuario;
    private String estado;
    private String mensaje;
    private List<ImagenSolicitudDTO> imagenes = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
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

    public List<ImagenSolicitudDTO> getImagenes() {
        return imagenes;
    }

    public void setImagenes(List<ImagenSolicitudDTO> imagenes) {
        this.imagenes = imagenes;
    }
}