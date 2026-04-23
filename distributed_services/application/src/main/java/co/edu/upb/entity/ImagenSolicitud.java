package co.edu.upb.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ImagenSolicitud {

    private Long idImagen;
    private Long idLote;
    private String nombreArchivo;
    private String rutaOriginal;
    private String rutaResultado;
    private String formatoEntrada;
    private String formatoSalida;
    private String estado;
    private LocalDateTime fechaRecepcion;
    private LocalDateTime fechaProcesamiento;
    private BigDecimal tiempoEjecucion;
    private Long idNodo;

    public Long getIdImagen() {
        return idImagen;
    }

    public void setIdImagen(Long idImagen) {
        this.idImagen = idImagen;
    }

    public Long getIdLote() {
        return idLote;
    }

    public void setIdLote(Long idLote) {
        this.idLote = idLote;
    }

    public String getNombreArchivo() {
        return nombreArchivo;
    }

    public void setNombreArchivo(String nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
    }

    public String getRutaOriginal() {
        return rutaOriginal;
    }

    public void setRutaOriginal(String rutaOriginal) {
        this.rutaOriginal = rutaOriginal;
    }

    public String getRutaResultado() {
        return rutaResultado;
    }

    public void setRutaResultado(String rutaResultado) {
        this.rutaResultado = rutaResultado;
    }

    public String getFormatoEntrada() {
        return formatoEntrada;
    }

    public void setFormatoEntrada(String formatoEntrada) {
        this.formatoEntrada = formatoEntrada;
    }

    public String getFormatoSalida() {
        return formatoSalida;
    }

    public void setFormatoSalida(String formatoSalida) {
        this.formatoSalida = formatoSalida;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaRecepcion() {
        return fechaRecepcion;
    }

    public void setFechaRecepcion(LocalDateTime fechaRecepcion) {
        this.fechaRecepcion = fechaRecepcion;
    }

    public LocalDateTime getFechaProcesamiento() {
        return fechaProcesamiento;
    }

    public void setFechaProcesamiento(LocalDateTime fechaProcesamiento) {
        this.fechaProcesamiento = fechaProcesamiento;
    }

    public BigDecimal getTiempoEjecucion() {
        return tiempoEjecucion;
    }

    public void setTiempoEjecucion(BigDecimal tiempoEjecucion) {
        this.tiempoEjecucion = tiempoEjecucion;
    }

    public Long getIdNodo() {
        return idNodo;
    }

    public void setIdNodo(Long idNodo) {
        this.idNodo = idNodo;
    }
}