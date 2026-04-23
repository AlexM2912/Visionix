package co.edu.upb.endpoint;

import java.util.List;

import co.edu.upb.dto.EstadoNodoDTO;
import co.edu.upb.dto.MetricaNodoDTO;
import co.edu.upb.dto.TrabajoImagenDTO;
import co.edu.upb.service.ServicioNodoProcesamiento;

public class NodoProcesamientoEndpoint {

    private final ServicioNodoProcesamiento servicioNodoProcesamiento;

    public NodoProcesamientoEndpoint(ServicioNodoProcesamiento servicioNodoProcesamiento) {
        this.servicioNodoProcesamiento = servicioNodoProcesamiento;
    }

    public int recibirTrabajos(List<TrabajoImagenDTO> trabajos) {
        return servicioNodoProcesamiento.recibirTrabajos(trabajos);
    }

    public EstadoNodoDTO obtenerEstadoNodo() {
        return servicioNodoProcesamiento.obtenerEstadoNodo();
    }

    public MetricaNodoDTO obtenerMetricasNodo() {
        return servicioNodoProcesamiento.obtenerMetricasNodo();
    }
}