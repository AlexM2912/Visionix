package co.edu.upb.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import co.edu.upb.client.ProcessingNodeGrpcClient;
import co.edu.upb.dto.ImagenSolicitudDTO;
import co.edu.upb.dto.SolicitudLoteDTO;
import co.edu.upb.dto.TrabajoImagenDTO;
import co.edu.upb.dto.TransformacionDTO;
import co.edu.upb.entity.ImagenSolicitud;
import co.edu.upb.entity.NodoTrabajador;
import co.edu.upb.grpc.RespuestaRecepcionTrabajos;
import co.edu.upb.repository.ImagenSolicitudRepository;
import co.edu.upb.repository.NodoTrabajadorRepository;
import co.edu.upb.service.NodoService.NodoDisponible;

public class DistribucionLoteService {

    private final NodoService nodoService;
    private final BalanceadorNodosService balanceadorNodosService;
    private final ProcessingNodeGrpcClient processingNodeGrpcClient;
    private final ImagenSolicitudRepository imagenSolicitudRepository;
    private final NodoTrabajadorRepository nodoTrabajadorRepository;

    public DistribucionLoteService() {
        this.nodoService = new NodoService();
        this.balanceadorNodosService = new BalanceadorNodosService();
        this.processingNodeGrpcClient = new ProcessingNodeGrpcClient();
        this.imagenSolicitudRepository = new ImagenSolicitudRepository();
        this.nodoTrabajadorRepository = new NodoTrabajadorRepository();
    }

    public Map<String, String> distribuirLote(SolicitudLoteDTO solicitudLoteDTO) {
        if (solicitudLoteDTO == null || solicitudLoteDTO.getId() == null) {
            throw new IllegalArgumentException("La solicitud de lote debe tener id.");
        }

        List<TrabajoImagenDTO> trabajos = construirTrabajosDesdeSolicitud(solicitudLoteDTO);
        List<NodoDisponible> nodosActivos = nodoService.obtenerNodosActivos();

        Map<NodoDisponible, List<TrabajoImagenDTO>> distribucion =
                balanceadorNodosService.distribuirTrabajos(trabajos, nodosActivos);

        Map<String, String> resumenEnvio = new HashMap<>();

        for (Map.Entry<NodoDisponible, List<TrabajoImagenDTO>> entry : distribucion.entrySet()) {
            NodoDisponible nodo = entry.getKey();
            List<TrabajoImagenDTO> trabajosNodo = entry.getValue();

            if (trabajosNodo == null || trabajosNodo.isEmpty()) {
                continue;
            }

            NodoTrabajador nodoBD = nodoTrabajadorRepository.buscarPorNombre(nodo.getIdNodo());

            if (nodoBD == null) {
                throw new IllegalStateException("El nodo " + nodo.getIdNodo() + " no está registrado en la base de datos.");
            }

            for (TrabajoImagenDTO trabajo : trabajosNodo) {
                imagenSolicitudRepository.asignarNodo(
                        trabajo.getIdImagen(),
                        nodoBD.getIdNodo(),
                        "ASIGNADA"
                );
            }

            int nuevaCarga = nodoBD.getCargaActual() + trabajosNodo.size();
            nodoTrabajadorRepository.actualizarCarga(
                    nodoBD.getIdNodo(),
                    nuevaCarga,
                    "ACTIVO"
            );

            RespuestaRecepcionTrabajos respuesta = processingNodeGrpcClient.enviarTrabajos(
                    nodo.getHost(),
                    nodo.getPuerto(),
                    trabajosNodo
            );

            String resumen = "Aceptados: " + respuesta.getAceptados()
                    + ", Rechazados: " + respuesta.getRechazados()
                    + ", Mensaje: " + respuesta.getMensaje();

            resumenEnvio.put(nodo.getIdNodo(), resumen);
        }

        return resumenEnvio;
    }

    private List<TrabajoImagenDTO> construirTrabajosDesdeSolicitud(SolicitudLoteDTO solicitudLoteDTO) {
        List<TrabajoImagenDTO> trabajos = new ArrayList<>();
        List<ImagenSolicitud> imagenesPersistidas = imagenSolicitudRepository.listarPorLote(solicitudLoteDTO.getId());

        if (imagenesPersistidas.isEmpty()) {
            throw new IllegalStateException("No se encontraron imágenes persistidas para el lote " + solicitudLoteDTO.getId());
        }

        Map<String, ImagenSolicitudDTO> imagenesPorNombreYRuta = new HashMap<>();
        for (ImagenSolicitudDTO dto : solicitudLoteDTO.getImagenes()) {
            String clave = dto.getNombreArchivo() + "|" + dto.getRutaOrigen();
            imagenesPorNombreYRuta.put(clave, dto);
        }

        for (ImagenSolicitud imagenPersistida : imagenesPersistidas) {
            String clave = imagenPersistida.getNombreArchivo() + "|" + imagenPersistida.getRutaOriginal();
            ImagenSolicitudDTO imagenDTO = imagenesPorNombreYRuta.get(clave);

            TrabajoImagenDTO trabajo = new TrabajoImagenDTO();
            trabajo.setIdLote(solicitudLoteDTO.getId());
            trabajo.setIdImagen(imagenPersistida.getIdImagen());
            trabajo.setNombreArchivo(imagenPersistida.getNombreArchivo());
            trabajo.setRutaOrigen(imagenPersistida.getRutaOriginal());

            List<TransformacionDTO> transformaciones = new ArrayList<>();
            if (imagenDTO != null && imagenDTO.getTransformaciones() != null) {
                transformaciones.addAll(imagenDTO.getTransformaciones());
            }

            trabajo.setTransformaciones(transformaciones);
            trabajos.add(trabajo);
        }

        return trabajos;
    }
}