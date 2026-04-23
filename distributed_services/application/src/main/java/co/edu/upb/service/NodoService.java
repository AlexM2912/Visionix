package co.edu.upb.service;

import java.util.ArrayList;
import java.util.List;

import co.edu.upb.client.ProcessingNodeGrpcClient;
import co.edu.upb.dto.EstadoNodoDTO;

public class NodoService {

    private final ProcessingNodeGrpcClient processingNodeGrpcClient;

    public NodoService() {
        this.processingNodeGrpcClient = new ProcessingNodeGrpcClient();
    }

    public List<NodoDisponible> obtenerNodosConfigurados() {
        List<NodoDisponible> nodos = new ArrayList<>();
        nodos.add(new NodoDisponible("nodo-1", "localhost", 50051));
        nodos.add(new NodoDisponible("nodo-2", "localhost", 50062));
        nodos.add(new NodoDisponible("nodo-3", "localhost", 50053));
        return nodos;
    }

    public List<NodoDisponible> obtenerNodosActivos() {
        List<NodoDisponible> nodosActivos = new ArrayList<>();

        for (NodoDisponible nodo : obtenerNodosConfigurados()) {
            try {
                EstadoNodoDTO estado = processingNodeGrpcClient.obtenerEstadoNodo(
                        nodo.getHost(),
                        nodo.getPuerto()
                );

                if (estado.isActivo()) {
                    nodo.setEstadoNodo(estado);
                    nodosActivos.add(nodo);
                }
            } catch (Exception e) {
                System.out.println("No se pudo conectar con " + nodo.getIdNodo() + ": " + e.getMessage());
            }
        }

        return nodosActivos;
    }

    public List<EstadoNodoDTO> obtenerEstadosNodos() {
        List<EstadoNodoDTO> estados = new ArrayList<>();

        for (NodoDisponible nodo : obtenerNodosConfigurados()) {
            EstadoNodoDTO estado;

            try {
                estado = processingNodeGrpcClient.obtenerEstadoNodo(
                        nodo.getHost(),
                        nodo.getPuerto()
                );
            } catch (Exception e) {
                estado = new EstadoNodoDTO();
                estado.setIdNodo(nodo.getIdNodo());
                estado.setActivo(false);
                estado.setCapacidadMaxima(0);
                estado.setCargaActual(0);
                estado.setCapacidadDisponible(0);
                estado.setHilosConfigurados(0);
            }

            estado.setHost(nodo.getHost());
            estado.setPuerto(nodo.getPuerto());
            estados.add(estado);
        }

        return estados;
    }

    public static class NodoDisponible {
        private String idNodo;
        private String host;
        private int puerto;
        private EstadoNodoDTO estadoNodo;

        public NodoDisponible(String idNodo, String host, int puerto) {
            this.idNodo = idNodo;
            this.host = host;
            this.puerto = puerto;
        }

        public String getIdNodo() {
            return idNodo;
        }

        public void setIdNodo(String idNodo) {
            this.idNodo = idNodo;
        }

        public String getHost() {
            return host;
        }

        public void setHost(String host) {
            this.host = host;
        }

        public int getPuerto() {
            return puerto;
        }

        public void setPuerto(int puerto) {
            this.puerto = puerto;
        }

        public EstadoNodoDTO getEstadoNodo() {
            return estadoNodo;
        }

        public void setEstadoNodo(EstadoNodoDTO estadoNodo) {
            this.estadoNodo = estadoNodo;
        }
    }
}
