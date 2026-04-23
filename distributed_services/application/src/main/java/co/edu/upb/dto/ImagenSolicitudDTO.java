package co.edu.upb.dto;

import java.util.ArrayList;
import java.util.List;

public class ImagenSolicitudDTO {

    private String nombreArchivo;
    private String rutaOrigen;
    private List<TransformacionDTO> transformaciones = new ArrayList<>();

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