package co.edu.upb.client;

import java.util.List;
import java.util.concurrent.TimeUnit;

import co.edu.upb.dto.EstadoNodoDTO;
import co.edu.upb.dto.MetricaNodoDTO;
import co.edu.upb.dto.TrabajoImagenDTO;
import co.edu.upb.dto.TransformacionDTO;
import co.edu.upb.grpc.EstadoNodoRequest;
import co.edu.upb.grpc.EstadoNodoResponse;
import co.edu.upb.grpc.MetricasNodoRequest;
import co.edu.upb.grpc.MetricasNodoResponse;
import co.edu.upb.grpc.RespuestaRecepcionTrabajos;
import co.edu.upb.grpc.ServicioNodoProcesamientoGrpc;
import co.edu.upb.grpc.SolicitudTrabajosRequest;
import co.edu.upb.grpc.TrabajoImagenRequest;
import co.edu.upb.grpc.TransformacionRequest;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

public class ProcessingNodeGrpcClient {

    public EstadoNodoDTO obtenerEstadoNodo(String host, int puerto) {
        ManagedChannel channel = ManagedChannelBuilder
                .forAddress(host, puerto)
                .usePlaintext()
                .build();

        try {
            ServicioNodoProcesamientoGrpc.ServicioNodoProcesamientoBlockingStub stub =
                    ServicioNodoProcesamientoGrpc.newBlockingStub(channel)
                            .withDeadlineAfter(3, TimeUnit.SECONDS);

            EstadoNodoResponse response = stub.obtenerEstadoNodo(
                    EstadoNodoRequest.newBuilder().build()
            );

            EstadoNodoDTO estado = new EstadoNodoDTO();
            estado.setIdNodo(response.getIdNodo());
            estado.setActivo(response.getActivo());
            estado.setCapacidadMaxima(response.getCapacidadMaxima());
            estado.setCargaActual(response.getCargaActual());
            estado.setCapacidadDisponible(response.getCapacidadDisponible());
            estado.setHilosConfigurados(response.getHilosConfigurados());

            return estado;
        } finally {
            channel.shutdown();
        }
    }

    public MetricaNodoDTO obtenerMetricasNodo(String host, int puerto) {
        ManagedChannel channel = ManagedChannelBuilder
                .forAddress(host, puerto)
                .usePlaintext()
                .build();

        try {
            ServicioNodoProcesamientoGrpc.ServicioNodoProcesamientoBlockingStub stub =
                    ServicioNodoProcesamientoGrpc.newBlockingStub(channel)
                            .withDeadlineAfter(3, TimeUnit.SECONDS);

            MetricasNodoResponse response = stub.obtenerMetricasNodo(
                    MetricasNodoRequest.newBuilder().build()
            );

            MetricaNodoDTO metrica = new MetricaNodoDTO();
            metrica.setIdNodo(response.getIdNodo());
            metrica.setTrabajosRecibidos(response.getTrabajosRecibidos());
            metrica.setTrabajosCompletados(response.getTrabajosCompletados());
            metrica.setTrabajosFallidos(response.getTrabajosFallidos());
            metrica.setTiempoTotalProcesamientoMs(response.getTiempoTotalProcesamientoMs());
            metrica.setTiempoPromedioProcesamientoMs(response.getTiempoPromedioProcesamientoMs());
            metrica.setCargaActual(response.getCargaActual());

            return metrica;
        } finally {
            channel.shutdown();
        }
    }

    public RespuestaRecepcionTrabajos enviarTrabajos(String host, int puerto, List<TrabajoImagenDTO> trabajos) {
        ManagedChannel channel = ManagedChannelBuilder
                .forAddress(host, puerto)
                .usePlaintext()
                .build();

        try {
            ServicioNodoProcesamientoGrpc.ServicioNodoProcesamientoBlockingStub stub =
                    ServicioNodoProcesamientoGrpc.newBlockingStub(channel)
                            .withDeadlineAfter(10, TimeUnit.SECONDS);

            SolicitudTrabajosRequest.Builder solicitudBuilder = SolicitudTrabajosRequest.newBuilder();

            for (TrabajoImagenDTO trabajo : trabajos) {
                TrabajoImagenRequest.Builder trabajoBuilder = TrabajoImagenRequest.newBuilder()
                        .setIdLote(trabajo.getIdLote() == null ? 0L : trabajo.getIdLote())
                        .setIdImagen(trabajo.getIdImagen() == null ? 0L : trabajo.getIdImagen())
                        .setNombreArchivo(trabajo.getNombreArchivo() == null ? "" : trabajo.getNombreArchivo())
                        .setRutaOrigen(trabajo.getRutaOrigen() == null ? "" : trabajo.getRutaOrigen());

                if (trabajo.getTransformaciones() != null) {
                    for (TransformacionDTO transformacion : trabajo.getTransformaciones()) {
                        TransformacionRequest transformacionRequest = TransformacionRequest.newBuilder()
                                .setTipo(transformacion.getTipo() == null ? "" : transformacion.getTipo())
                                .setValor(transformacion.getValor() == null ? "" : transformacion.getValor())
                                .build();

                        trabajoBuilder.addTransformaciones(transformacionRequest);
                    }
                }

                solicitudBuilder.addTrabajos(trabajoBuilder.build());
            }

            return stub.recibirTrabajos(solicitudBuilder.build());
        } finally {
            channel.shutdown();
        }
    }
}
