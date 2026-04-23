package co.edu.upb.entity;

public class Transformacion {

    private Long idTransformacion;
    private Long idImagen;
    private String tipo;
    private Integer ordenTransformacion;
    private String parametros;

    public Long getIdTransformacion() {
        return idTransformacion;
    }

    public void setIdTransformacion(Long idTransformacion) {
        this.idTransformacion = idTransformacion;
    }

    public Long getIdImagen() {
        return idImagen;
    }

    public void setIdImagen(Long idImagen) {
        this.idImagen = idImagen;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Integer getOrdenTransformacion() {
        return ordenTransformacion;
    }

    public void setOrdenTransformacion(Integer ordenTransformacion) {
        this.ordenTransformacion = ordenTransformacion;
    }

    public String getParametros() {
        return parametros;
    }

    public void setParametros(String parametros) {
        this.parametros = parametros;
    }
}