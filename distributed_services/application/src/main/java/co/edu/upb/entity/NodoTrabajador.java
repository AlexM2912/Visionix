package co.edu.upb.entity;

import java.time.LocalDateTime;

public class NodoTrabajador {

    private Long idNodo;
    private String nombre;
    private String direccionRed;
    private Integer puerto;
    private String estado;
    private Integer cargaActual;
    private Integer capacidadMaxima;
    private LocalDateTime fechaRegistro;

    public Long getIdNodo() {
        return idNodo;
    }

    public void setIdNodo(Long idNodo) {
        this.idNodo = idNodo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDireccionRed() {
        return direccionRed;
    }

    public void setDireccionRed(String direccionRed) {
        this.direccionRed = direccionRed;
    }

    public Integer getPuerto() {
        return puerto;
    }

    public void setPuerto(Integer puerto) {
        this.puerto = puerto;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Integer getCargaActual() {
        return cargaActual;
    }

    public void setCargaActual(Integer cargaActual) {
        this.cargaActual = cargaActual;
    }

    public Integer getCapacidadMaxima() {
        return capacidadMaxima;
    }

    public void setCapacidadMaxima(Integer capacidadMaxima) {
        this.capacidadMaxima = capacidadMaxima;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
}