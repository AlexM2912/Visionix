package co.edu.upb.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SolicitudLote {

    private Long idLote;
    private Long usuarioId;
    private LocalDateTime fechaRecepcion;
    private String estado;
    private BigDecimal porcentajeProgreso;
    private Integer cantidadImagenes;

    public Long getIdLote() {
        return idLote;
    }

    public void setIdLote(Long idLote) {
        this.idLote = idLote;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public LocalDateTime getFechaRecepcion() {
        return fechaRecepcion;
    }

    public void setFechaRecepcion(LocalDateTime fechaRecepcion) {
        this.fechaRecepcion = fechaRecepcion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public BigDecimal getPorcentajeProgreso() {
        return porcentajeProgreso;
    }

    public void setPorcentajeProgreso(BigDecimal porcentajeProgreso) {
        this.porcentajeProgreso = porcentajeProgreso;
    }

    public Integer getCantidadImagenes() {
        return cantidadImagenes;
    }

    public void setCantidadImagenes(Integer cantidadImagenes) {
        this.cantidadImagenes = cantidadImagenes;
    }
}