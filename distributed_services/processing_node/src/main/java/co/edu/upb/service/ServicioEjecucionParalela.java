package co.edu.upb.service;

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import co.edu.upb.dto.ResultadoProcesamientoDTO;
import co.edu.upb.dto.TrabajoImagenDTO;

public class ServicioEjecucionParalela {

    private final ExecutorService executorService;

    public ServicioEjecucionParalela(int cantidadHilos) {
        this.executorService = Executors.newFixedThreadPool(cantidadHilos);
    }

    public Future<ResultadoProcesamientoDTO> ejecutarAsync(
            TrabajoImagenDTO trabajo,
            Callable<ResultadoProcesamientoDTO> tarea) {
        return executorService.submit(tarea);
    }

    public void cerrar() {
        executorService.shutdown();
    }
}