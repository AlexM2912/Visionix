package co.edu.upb.dto;

import java.util.ArrayList;
import java.util.List;

public class TrabajoImagenDTO {

    private Long idLote;
    private Long idImagen;
    private String nombreArchivo;
    private String rutaOrigen;
    private List<TransformacionDTO> transformaciones = new ArrayList<>();

    public Long getIdLote() {
        return idLote;
    }

    public void setIdLote(Long idLote) {
        this.idLote = idLote;
    }

    public Long getIdImagen() {
        return idImagen;
    }

    public void setIdImagen(Long idImagen) {
        this.idImagen = idImagen;
    }

    public String getNombreArchivo() {
        return nombreArchivo;
    }

    public void setNombreArchivo(String nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
    }

    public String getRutaOrigen() {
        return rutaOrigen;
    }

    public void setRutaOrigen(String rutaOrigen) {
        this.rutaOrigen = rutaOrigen;
    }

    public List<TransformacionDTO> getTransformaciones() {
        return transformaciones;
    }

    public void setTransformaciones(List<TransformacionDTO> transformaciones) {
        this.transformaciones = transformaciones;
    }
}