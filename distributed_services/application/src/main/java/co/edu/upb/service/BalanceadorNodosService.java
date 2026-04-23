package co.edu.upb.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import co.edu.upb.dto.TrabajoImagenDTO;
import co.edu.upb.service.NodoService.NodoDisponible;

public class BalanceadorNodosService {

    public Map<NodoDisponible, List<TrabajoImagenDTO>> distribuirTrabajos(
            List<TrabajoImagenDTO> trabajos,
            List<NodoDisponible> nodosActivos) {

        Map<NodoDisponible, List<TrabajoImagenDTO>> distribucion = new HashMap<>();

        if (trabajos == null || trabajos.isEmpty()) {
            return distribucion;
        }

        if (nodosActivos == null || nodosActivos.isEmpty()) {
            throw new IllegalStateException("No hay nodos activos disponibles.");
        }

        List<NodoDisponible> nodosOrdenados = new ArrayList<>(nodosActivos);
        nodosOrdenados.sort(Comparator.comparingInt(
                (NodoDisponible n) -> n.getEstadoNodo().getCapacidadDisponible()
        ).reversed());

        for (NodoDisponible nodo : nodosOrdenados) {
            distribucion.put(nodo, new ArrayList<>());
        }

        int indiceNodo = 0;

        for (TrabajoImagenDTO trabajo : trabajos) {
            boolean asignado = false;
            int intentos = 0;

            while (!asignado && intentos < nodosOrdenados.size()) {
                NodoDisponible nodo = nodosOrdenados.get(indiceNodo);
                List<TrabajoImagenDTO> listaNodo = distribucion.get(nodo);
                int capacidadDisponible = nodo.getEstadoNodo().getCapacidadDisponible();

                if (listaNodo.size() < capacidadDisponible) {
                    listaNodo.add(trabajo);
                    asignado = true;
                }

                indiceNodo = (indiceNodo + 1) % nodosOrdenados.size();
                intentos++;
            }

            if (!asignado) {
                throw new IllegalStateException(
                        "No hay capacidad suficiente en los nodos para procesar todas las imágenes del lote."
                );
            }
        }

        return distribucion;
    }
}