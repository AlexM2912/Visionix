package co.edu.upb.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import co.edu.upb.dto.ImagenSolicitudDTO;
import co.edu.upb.dto.SolicitudLoteDTO;
import co.edu.upb.dto.TransformacionDTO;
import co.edu.upb.entity.ImagenSolicitud;
import co.edu.upb.entity.SolicitudLote;
import co.edu.upb.entity.Transformacion;
import co.edu.upb.repository.ImagenSolicitudRepository;
import co.edu.upb.repository.SolicitudLoteRepository;
import co.edu.upb.repository.TransformacionRepository;

public class LoteService {

    private final SolicitudLoteRepository solicitudLoteRepository;
    private final ImagenSolicitudRepository imagenSolicitudRepository;
    private final TransformacionRepository transformacionRepository;
    private final DistribucionLoteService distribucionLoteService;

    public LoteService() {
        this.solicitudLoteRepository = new SolicitudLoteRepository();
        this.imagenSolicitudRepository = new ImagenSolicitudRepository();
        this.transformacionRepository = new TransformacionRepository();
        this.distribucionLoteService = new DistribucionLoteService();
    }

    public SolicitudLoteDTO crearSolicitudLote(Long idUsuario, SolicitudLoteDTO solicitudEntrada) {
        System.out.println("DEBUG APP 1 - Entrando a crearSolicitudLote para usuario: " + idUsuario);

        validarSolicitud(idUsuario, solicitudEntrada);

        SolicitudLote lote = new SolicitudLote();
        lote.setUsuarioId(idUsuario);
        lote.setFechaRecepcion(LocalDateTime.now());
        lote.setEstado("PENDIENTE");
        lote.setPorcentajeProgreso(BigDecimal.ZERO);
        lote.setCantidadImagenes(solicitudEntrada.getImagenes().size());

        Long idLote = solicitudLoteRepository.guardar(lote);
        System.out.println("DEBUG APP 2 - Lote guardado con id: " + idLote);

        int contadorOrden;
        for (ImagenSolicitudDTO imagenDTO : solicitudEntrada.getImagenes()) {
            ImagenSolicitud imagen = new ImagenSolicitud();
            imagen.setIdLote(idLote);
            imagen.setNombreArchivo(imagenDTO.getNombreArchivo());
            imagen.setRutaOriginal(imagenDTO.getRutaOrigen());
            imagen.setRutaResultado(null);
            imagen.setFormatoEntrada(obtenerExtension(imagenDTO.getNombreArchivo()));
            imagen.setFormatoSalida(null);
            imagen.setEstado("PENDIENTE");
            imagen.setFechaRecepcion(LocalDateTime.now());
            imagen.setFechaProcesamiento(null);
            imagen.setTiempoEjecucion(null);
            imagen.setIdNodo(null);

            Long idImagen = imagenSolicitudRepository.guardar(imagen);
            System.out.println("DEBUG APP 3 - Imagen guardada con id: " + idImagen + " para lote: " + idLote);

            contadorOrden = 1;
            if (imagenDTO.getTransformaciones() != null) {
                for (TransformacionDTO transformacionDTO : imagenDTO.getTransformaciones()) {
                    Transformacion transformacion = new Transformacion();
                    transformacion.setIdImagen(idImagen);
                    transformacion.setTipo(transformacionDTO.getTipo());
                    transformacion.setOrdenTransformacion(contadorOrden++);
                    transformacion.setParametros(transformacionDTO.getValor());
                    transformacionRepository.guardar(transformacion);
                }
            }
        }

        SolicitudLoteDTO loteDTO = new SolicitudLoteDTO();
        loteDTO.setId(idLote);
        loteDTO.setIdUsuario(idUsuario);
        loteDTO.setEstado("PENDIENTE");
        loteDTO.setMensaje("Lote registrado correctamente");
        loteDTO.setImagenes(solicitudEntrada.getImagenes());

        try {
            Map<String, String> resumenDistribucion = distribucionLoteService.distribuirLote(loteDTO);

            solicitudLoteRepository.actualizarEstadoYProgreso(
                    idLote,
                    "EN_PROCESO",
                    BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
            );

            System.out.println("DEBUG APP 4 - Lote " + idLote + " actualizado a EN_PROCESO");

            loteDTO.setEstado("EN_PROCESO");
            loteDTO.setMensaje("Lote distribuido correctamente: " + resumenDistribucion);
        } catch (Exception e) {
            e.printStackTrace();

            solicitudLoteRepository.actualizarEstadoYProgreso(
                    idLote,
                    "ERROR",
                    BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
            );

            System.out.println("DEBUG APP 5 - Lote " + idLote + " actualizado a ERROR");

            loteDTO.setEstado("ERROR");
            loteDTO.setMensaje("Error al distribuir el lote: " + e.getMessage());
        }

        return loteDTO;
    }

    public SolicitudLoteDTO consultarEstadoSolicitud(Long idLote) {
        SolicitudLote lote = solicitudLoteRepository.buscarPorId(idLote);

        if (lote == null) {
            throw new IllegalArgumentException("No existe un lote con id: " + idLote);
        }

        List<ImagenSolicitud> imagenes = imagenSolicitudRepository.listarPorLote(idLote);

        int total = imagenes.size();
        int procesadas = 0;
        int conError = 0;

        for (ImagenSolicitud imagen : imagenes) {
            if ("PROCESADA".equalsIgnoreCase(imagen.getEstado())) {
                procesadas++;
            } else if ("ERROR".equalsIgnoreCase(imagen.getEstado())) {
                conError++;
            }
        }

        BigDecimal progreso = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        String estado = lote.getEstado();

        if (total > 0) {
            progreso = BigDecimal.valueOf((procesadas * 100.0) / total)
                    .setScale(2, RoundingMode.HALF_UP);

            if (conError > 0) {
                estado = "ERROR";
            } else if (procesadas == total) {
                estado = "COMPLETADO";
                progreso = BigDecimal.valueOf(100.00).setScale(2, RoundingMode.HALF_UP);
            } else if (procesadas > 0) {
                estado = "EN_PROCESO";
            } else if ("ERROR".equalsIgnoreCase(lote.getEstado())) {
                estado = "ERROR";
            } else {
                estado = "EN_PROCESO";
            }

            solicitudLoteRepository.actualizarEstadoYProgreso(idLote, estado, progreso);
            lote = solicitudLoteRepository.buscarPorId(idLote);
        }

        SolicitudLoteDTO dto = new SolicitudLoteDTO();
        dto.setId(lote.getIdLote());
        dto.setIdUsuario(lote.getUsuarioId());
        dto.setEstado(lote.getEstado());
        dto.setMensaje("Consulta realizada correctamente");
        return dto;
    }

    private void validarSolicitud(Long idUsuario, SolicitudLoteDTO solicitudEntrada) {
        if (idUsuario == null || idUsuario <= 0) {
            throw new IllegalArgumentException("El id del usuario es obligatorio y debe ser mayor que cero.");
        }

        if (solicitudEntrada == null) {
            throw new IllegalArgumentException("La solicitud no puede ser nula.");
        }

        List<ImagenSolicitudDTO> imagenes = solicitudEntrada.getImagenes();

        if (imagenes == null || imagenes.isEmpty()) {
            throw new IllegalArgumentException("La solicitud debe incluir al menos una imagen.");
        }

        if (imagenes.size() > 150) {
            throw new IllegalArgumentException("Con 3 nodos activos, el sistema soporta máximo 150 imágenes por lote.");
        }

        for (ImagenSolicitudDTO imagen : imagenes) {
            if (imagen.getNombreArchivo() == null || imagen.getNombreArchivo().isBlank()) {
                throw new IllegalArgumentException("Cada imagen debe tener nombre de archivo.");
            }

            if (imagen.getRutaOrigen() == null || imagen.getRutaOrigen().isBlank()) {
                throw new IllegalArgumentException("Cada imagen debe tener ruta de origen.");
            }

            if (imagen.getTransformaciones() == null || imagen.getTransformaciones().isEmpty()) {
                throw new IllegalArgumentException("Cada imagen debe tener al menos una transformación.");
            }

            if (imagen.getTransformaciones().size() > 5) {
                throw new IllegalArgumentException("Cada imagen puede tener máximo 5 transformaciones.");
            }
        }
    }

    private String obtenerExtension(String nombreArchivo) {
        int indice = nombreArchivo.lastIndexOf('.');
        if (indice == -1) {
            return null;
        }
        return nombreArchivo.substring(indice + 1).toLowerCase();
    }
}