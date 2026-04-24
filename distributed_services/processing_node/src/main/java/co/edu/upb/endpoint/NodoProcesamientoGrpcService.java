package co.edu.upb.endpoint;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.List;

import co.edu.upb.dto.EstadoNodoDTO;
import co.edu.upb.dto.MetricaNodoDTO;
import co.edu.upb.dto.ResultadoProcesamientoDTO;
import co.edu.upb.dto.TrabajoImagenDTO;
import co.edu.upb.dto.TransformacionDTO;
import co.edu.upb.grpc.EstadoNodoRequest;
import co.edu.upb.grpc.EstadoNodoResponse;
import co.edu.upb.grpc.MetricasNodoRequest;
import co.edu.upb.grpc.MetricasNodoResponse;
import co.edu.upb.grpc.RespuestaRecepcionTrabajos;
import co.edu.upb.grpc.ResultadoImagenResponse;
import co.edu.upb.grpc.ServicioNodoProcesamientoGrpc;
import co.edu.upb.grpc.SolicitudTrabajosRequest;
import co.edu.upb.grpc.TrabajoImagenRequest;
import co.edu.upb.service.ServicioNodoProcesamiento;
import io.grpc.stub.StreamObserver;

public class NodoProcesamientoGrpcService extends ServicioNodoProcesamientoGrpc.ServicioNodoProcesamientoImplBase {

    private final ServicioNodoProcesamiento servicioNodoProcesamiento;

    public NodoProcesamientoGrpcService(ServicioNodoProcesamiento servicioNodoProcesamiento) {
        this.servicioNodoProcesamiento = servicioNodoProcesamiento;
    }

    @Override
    public void obtenerEstadoNodo(EstadoNodoRequest request, StreamObserver<EstadoNodoResponse> responseObserver) {
        EstadoNodoDTO estado = servicioNodoProcesamiento.obtenerEstadoNodo();

        EstadoNodoResponse respuesta = EstadoNodoResponse.newBuilder()
                .setIdNodo(estado.getIdNodo())
                .setActivo(estado.isActivo())
                .setCapacidadMaxima(estado.getCapacidadMaxima())
                .setCargaActual(estado.getCargaActual())
                .setCapacidadDisponible(estado.getCapacidadDisponible())
                .setHilosConfigurados(estado.getHilosConfigurados())
                .build();

        responseObserver.onNext(respuesta);
        responseObserver.onCompleted();
    }

    @Override
    public void obtenerMetricasNodo(MetricasNodoRequest request, StreamObserver<MetricasNodoResponse> responseObserver) {
        MetricaNodoDTO metricas = servicioNodoProcesamiento.obtenerMetricasNodo();

        MetricasNodoResponse respuesta = MetricasNodoResponse.newBuilder()
                .setIdNodo(metricas.getIdNodo())
                .setTrabajosRecibidos(metricas.getTrabajosRecibidos())
                .setTrabajosCompletados(metricas.getTrabajosCompletados())
                .setTrabajosFallidos(metricas.getTrabajosFallidos())
                .setTiempoTotalProcesamientoMs(metricas.getTiempoTotalProcesamientoMs())
                .setTiempoPromedioProcesamientoMs(metricas.getTiempoPromedioProcesamientoMs())
                .setCargaActual(metricas.getCargaActual())
                .build();

        responseObserver.onNext(respuesta);
        responseObserver.onCompleted();
    }

    @Override
    public void recibirTrabajos(SolicitudTrabajosRequest request, StreamObserver<RespuestaRecepcionTrabajos> responseObserver) {
        List<TrabajoImagenDTO> trabajos = request.getTrabajosList().stream()
                .map(this::mapearTrabajo)
                .toList();

        List<ResultadoProcesamientoDTO> resultados = servicioNodoProcesamiento.recibirTrabajosConResultados(trabajos);

        List<ResultadoImagenResponse> resultadosGrpc = resultados.stream()
                .map(this::mapearResultado)
                .toList();

        int aceptados = resultados.size();
        int rechazados = trabajos.size() - aceptados;

        RespuestaRecepcionTrabajos respuesta = RespuestaRecepcionTrabajos.newBuilder()
                .setAceptados(aceptados)
                .setRechazados(rechazados)
                .setMensaje("Trabajos procesados por el nodo.")
                .addAllResultados(resultadosGrpc)
                .build();

        responseObserver.onNext(respuesta);
        responseObserver.onCompleted();
    }

    private ResultadoImagenResponse mapearResultado(ResultadoProcesamientoDTO resultado) {
        String imagenBase64 = "";

        try {
            if (resultado.getRutaResultado() != null) {
                byte[] bytes = Files.readAllBytes(Path.of(resultado.getRutaResultado()));
                imagenBase64 = Base64.getEncoder().encodeToString(bytes);
            }
        } catch (Exception e) {
            imagenBase64 = "";
        }

        return ResultadoImagenResponse.newBuilder()
                .setIdImagen(resultado.getIdImagen() != null ? resultado.getIdImagen() : 0)
                .setNombreArchivo(resultado.getRutaResultado() != null ? Path.of(resultado.getRutaResultado()).getFileName().toString() : "")
                .setRutaResultado(resultado.getRutaResultado() != null ? resultado.getRutaResultado().replace("\\", "/") : "")
                .setFormatoSalida(obtenerFormato(resultado.getRutaResultado()))
                .setImagenBase64(imagenBase64)
                .setExitoso("COMPLETADO".equalsIgnoreCase(resultado.getEstado()))
                .setMensaje(resultado.getMensaje() != null ? resultado.getMensaje() : "")
                .build();
    }

    private String obtenerFormato(String ruta) {
        if (ruta == null || !ruta.contains(".")) {
            return "jpg";
        }

        return ruta.substring(ruta.lastIndexOf(".") + 1).toLowerCase();
    }

    private TrabajoImagenDTO mapearTrabajo(TrabajoImagenRequest grpc) {
        TrabajoImagenDTO dto = new TrabajoImagenDTO();
        dto.setIdLote(grpc.getIdLote());
        dto.setIdImagen(grpc.getIdImagen());
        dto.setNombreArchivo(grpc.getNombreArchivo());
        dto.setRutaOrigen(grpc.getRutaOrigen());

        List<TransformacionDTO> transformaciones = grpc.getTransformacionesList().stream().map(t -> {
            TransformacionDTO transformacion = new TransformacionDTO();
            transformacion.setTipo(t.getTipo());
            transformacion.setValor(t.getValor());
            return transformacion;
        }).toList();

        dto.setTransformaciones(transformaciones);
        return dto;
    }
}