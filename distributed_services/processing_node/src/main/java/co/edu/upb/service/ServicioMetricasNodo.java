package co.edu.upb.service;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

import co.edu.upb.dto.MetricaNodoDTO;

public class ServicioMetricasNodo {

    private final String idNodo;
    private final AtomicInteger trabajosRecibidos = new AtomicInteger(0);
    private final AtomicInteger trabajosCompletados = new AtomicInteger(0);
    private final AtomicInteger trabajosFallidos = new AtomicInteger(0);
    private final AtomicLong tiempoTotalProcesamientoMs = new AtomicLong(0);

    public ServicioMetricasNodo(String idNodo) {
        this.idNodo = idNodo;
    }

    public void registrarTrabajoRecibido() {
        trabajosRecibidos.incrementAndGet();
    }

    public void registrarTrabajoCompletado(long tiempoMs) {
        trabajosCompletados.incrementAndGet();
        tiempoTotalProcesamientoMs.addAndGet(tiempoMs);
    }

    public void registrarTrabajoFallido() {
        trabajosFallidos.incrementAndGet();
    }

    public MetricaNodoDTO obtenerMetricas(int cargaActual) {
        MetricaNodoDTO dto = new MetricaNodoDTO();
        dto.setIdNodo(idNodo);
        dto.setTrabajosRecibidos(trabajosRecibidos.get());
        dto.setTrabajosCompletados(trabajosCompletados.get());
        dto.setTrabajosFallidos(trabajosFallidos.get());
        dto.setTiempoTotalProcesamientoMs(tiempoTotalProcesamientoMs.get());
        dto.setCargaActual(cargaActual);

        if (trabajosCompletados.get() > 0) {
            dto.setTiempoPromedioProcesamientoMs(
                (double) tiempoTotalProcesamientoMs.get() / trabajosCompletados.get()
            );
        } else {
            dto.setTiempoPromedioProcesamientoMs(0);
        }

        return dto;
    }
}