package co.edu.upb.service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

import co.edu.upb.dto.TrabajoImagenDTO;

public class ServicioColaTrabajos {

    private final BlockingQueue<TrabajoImagenDTO> cola = new LinkedBlockingQueue<>();

    public void encolar(TrabajoImagenDTO trabajo) {
        cola.offer(trabajo);
    }

    public void desencolar(TrabajoImagenDTO trabajo) {
        cola.remove(trabajo);
    }

    public int tamanio() {
        return cola.size();
    }

    public List<TrabajoImagenDTO> listarTrabajos() {
        return new ArrayList<>(cola);
    }
}