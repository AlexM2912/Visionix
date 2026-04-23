package co.edu.upb.dto;

public class MetricaNodoDTO {

    private String idNodo;
    private int trabajosRecibidos;
    private int trabajosCompletados;
    private int trabajosFallidos;
    private long tiempoTotalProcesamientoMs;
    private double tiempoPromedioProcesamientoMs;
    private int cargaActual;

    public String getIdNodo() {
        return idNodo;
    }

    public void setIdNodo(String idNodo) {
        this.idNodo = idNodo;
    }

    public int getTrabajosRecibidos() {
        return trabajosRecibidos;
    }

    public void setTrabajosRecibidos(int trabajosRecibidos) {
        this.trabajosRecibidos = trabajosRecibidos;
    }

    public int getTrabajosCompletados() {
        return trabajosCompletados;
    }

    public void setTrabajosCompletados(int trabajosCompletados) {
        this.trabajosCompletados = trabajosCompletados;
    }

    public int getTrabajosFallidos() {
        return trabajosFallidos;
    }

    public void setTrabajosFallidos(int trabajosFallidos) {
        this.trabajosFallidos = trabajosFallidos;
    }

    public long getTiempoTotalProcesamientoMs() {
        return tiempoTotalProcesamientoMs;
    }

    public void setTiempoTotalProcesamientoMs(long tiempoTotalProcesamientoMs) {
        this.tiempoTotalProcesamientoMs = tiempoTotalProcesamientoMs;
    }

    public double getTiempoPromedioProcesamientoMs() {
        return tiempoPromedioProcesamientoMs;
    }

    public void setTiempoPromedioProcesamientoMs(double tiempoPromedioProcesamientoMs) {
        this.tiempoPromedioProcesamientoMs = tiempoPromedioProcesamientoMs;
    }

    public int getCargaActual() {
        return cargaActual;
    }

    public void setCargaActual(int cargaActual) {
        this.cargaActual = cargaActual;
    }
}