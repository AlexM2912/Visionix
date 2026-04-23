package co.edu.upb.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ResultadoProcesamiento {

    private Long idResultado;
    private Long idImagen;
    private String rutaArchivo;
    private String formatoSalida;
    private LocalDateTime fechaGeneracion;
    private BigDecimal tiempoEjecucion;
    private BigDecimal tamanoArchivoKb;

    public Long getIdResultado() {
        return idResultado;
    }

    public void setIdResultado(Long idResultado) {
        this.idResultado = idResultado;
    }

    public Long getIdImagen() {
        return idImagen;
    }

    public void setIdImagen(Long idImagen) {
        this.idImagen = idImagen;
    }

    public String getRutaArchivo() {
        return rutaArchivo;
    }

    public void setRutaArchivo(String rutaArchivo) {
        this.rutaArchivo = rutaArchivo;
    }

    public String getFormatoSalida() {
        return formatoSalida;
    }

    public void setFormatoSalida(String formatoSalida) {
        this.formatoSalida = formatoSalida;
    }

    public LocalDateTime getFechaGeneracion() {
        return fechaGeneracion;
    }

    public void setFechaGeneracion(LocalDateTime fechaGeneracion) {
        this.fechaGeneracion = fechaGeneracion;
    }

    public BigDecimal getTiempoEjecucion() {
        return tiempoEjecucion;
    }

    public void setTiempoEjecucion(BigDecimal tiempoEjecucion) {
        this.tiempoEjecucion = tiempoEjecucion;
    }

    public BigDecimal getTamanoArchivoKb() {
        return tamanoArchivoKb;
    }

    public void setTamanoArchivoKb(BigDecimal tamanoArchivoKb) {
        this.tamanoArchivoKb = tamanoArchivoKb;
    }
}