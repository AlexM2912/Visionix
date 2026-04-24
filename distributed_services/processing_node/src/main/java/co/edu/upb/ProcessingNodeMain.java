package co.edu.upb;

import co.edu.upb.config.ConfiguracionNodo;
import co.edu.upb.config.LectorConfiguracionNodo;
import co.edu.upb.endpoint.NodoProcesamientoGrpcService;
import co.edu.upb.service.ServicioNodoProcesamiento;
import io.grpc.Server;
import io.grpc.ServerBuilder;

public class ProcessingNodeMain {

    public static void main(String[] args) throws Exception {
        String archivoConfiguracion = args.length > 0 ? args[0] : "nodo1.properties";

        LectorConfiguracionNodo lectorConfiguracionNodo = new LectorConfiguracionNodo();
        ConfiguracionNodo configuracionNodo = lectorConfiguracionNodo.cargar(archivoConfiguracion);

        String portEnv = System.getenv("PORT");

        int puerto = portEnv != null && !portEnv.isBlank()
                ? Integer.parseInt(portEnv)
                : configuracionNodo.getPuerto();

        String serviceName = System.getenv("RAILWAY_SERVICE_NAME");
        String direccionInterna = serviceName != null && !serviceName.isBlank()
                ? serviceName + ".railway.internal:" + puerto
                : "localhost:" + puerto;

        ServicioNodoProcesamiento servicioNodoProcesamiento = new ServicioNodoProcesamiento(configuracionNodo);

        Server servidor = ServerBuilder
                .forPort(puerto)
                .addService(new NodoProcesamientoGrpcService(servicioNodoProcesamiento))
                .build();

        servidor.start();

        System.out.println("==============================================");
        System.out.println("NODO gRPC INICIADO");
        System.out.println("Nodo: " + configuracionNodo.getIdNodo());
        System.out.println("Puerto gRPC: " + puerto);
        System.out.println("Direccion interna: " + direccionInterna);
        System.out.println("Hilos: " + configuracionNodo.getCantidadHilos());
        System.out.println("Capacidad maxima: " + configuracionNodo.getCapacidadMaxima());
        System.out.println("Ruta almacenamiento: " + configuracionNodo.getRutaAlmacenamiento());
        System.out.println("==============================================");

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Apagando nodo " + configuracionNodo.getIdNodo());
            servicioNodoProcesamiento.apagarNodo();
            servidor.shutdown();
        }));

        servidor.awaitTermination();
    }
}