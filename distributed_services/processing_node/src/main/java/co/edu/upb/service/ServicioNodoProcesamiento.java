package co.edu.upb.service;
import java.awt.image.BufferedImage;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;

import co.edu.upb.almacenamiento.GestorAlmacenamiento;
import co.edu.upb.config.ConfiguracionNodo;
import co.edu.upb.dto.EstadoNodoDTO;
import co.edu.upb.dto.MetricaNodoDTO;
import co.edu.upb.dto.ResultadoProcesamientoDTO;
import co.edu.upb.dto.TrabajoImagenDTO;
import co.edu.upb.dto.TransformacionDTO;
import co.edu.upb.log.GestorLogs;
import co.edu.upb.processor.FabricaProcesadores;
import co.edu.upb.processor.ProcesadorImagen;
import co.edu.upb.repository.ImagenRepository;
import co.edu.upb.repository.LogRepository;
import co.edu.upb.repository.ResultadoRepository;
import co.edu.upb.util.ImagenUtil;

public class ServicioNodoProcesamiento {

    private final ConfiguracionNodo configuracionNodo;
    private final ServicioColaTrabajos servicioColaTrabajos;
    private final ServicioMetricasNodo servicioMetricasNodo;
    private final ServicioEjecucionParalela servicioEjecucionParalela;
    private final AtomicInteger cargaActual;
    private final GestorAlmacenamiento gestorAlmacenamiento;
    private final GestorLogs gestorLogs;
    private final ImagenUtil imagenUtil;
    private final FabricaProcesadores fabricaProcesadores;

    private final ResultadoRepository resultadoRepository;
    private final LogRepository logRepository;
    private final ImagenRepository imagenRepository;

    public ServicioNodoProcesamiento(ConfiguracionNodo configuracionNodo) {
        this.configuracionNodo = configuracionNodo;
        this.servicioColaTrabajos = new ServicioColaTrabajos();
        this.servicioMetricasNodo = new ServicioMetricasNodo(configuracionNodo.getIdNodo());
        this.servicioEjecucionParalela = new ServicioEjecucionParalela(configuracionNodo.getCantidadHilos());
        this.cargaActual = new AtomicInteger(0);
        this.gestorAlmacenamiento = new GestorAlmacenamiento();
        this.gestorLogs = new GestorLogs();
        this.imagenUtil = new ImagenUtil();
        this.fabricaProcesadores = new FabricaProcesadores();

        this.resultadoRepository = new ResultadoRepository();
        this.logRepository = new LogRepository();
        this.imagenRepository = new ImagenRepository();
    }

    public synchronized int recibirTrabajos(List<TrabajoImagenDTO> trabajos) {
        return recibirTrabajosConResultados(trabajos).size();
    }

    public synchronized List<ResultadoProcesamientoDTO> recibirTrabajosConResultados(List<TrabajoImagenDTO> trabajos) {
        List<ResultadoProcesamientoDTO> resultados = new ArrayList<>();

        if (trabajos == null || trabajos.isEmpty()) {
            gestorLogs.warn("No se recibieron trabajos para procesar en " + configuracionNodo.getIdNodo());
            return resultados;
        }

        int capacidadDisponible = configuracionNodo.getCapacidadMaxima() - cargaActual.get();
        int aceptados = Math.min(capacidadDisponible, trabajos.size());

        List<Future<ResultadoProcesamientoDTO>> futuros = new ArrayList<>();

        for (int i = 0; i < aceptados; i++) {
            TrabajoImagenDTO trabajo = trabajos.get(i);

            try {
                servicioColaTrabajos.encolar(trabajo);
                cargaActual.incrementAndGet();
                servicioMetricasNodo.registrarTrabajoRecibido();

                gestorLogs.info(
                    "Trabajo recibido en " + configuracionNodo.getIdNodo()
                    + ": idImagen=" + trabajo.getIdImagen()
                    + ", archivo=" + trabajo.getNombreArchivo()
                );

                registrarLogSeguro(
                    trabajo.getIdImagen(),
                    "INFO",
                    "Trabajo recibido en " + configuracionNodo.getIdNodo()
                );

                Future<ResultadoProcesamientoDTO> futuro = servicioEjecucionParalela.ejecutarAsync(
                    trabajo,
                    () -> procesarTrabajo(trabajo)
                );

                futuros.add(futuro);

            } catch (Exception e) {
                e.printStackTrace();

                gestorLogs.error(
                    "Error enviando trabajo a ejecución en "
                    + configuracionNodo.getIdNodo()
                    + ": " + e.getMessage()
                );

                registrarLogSeguro(
                    trabajo != null ? trabajo.getIdImagen() : null,
                    "ERROR",
                    "Error enviando trabajo a ejecución en "
                    + configuracionNodo.getIdNodo()
                    + ": " + e.getMessage()
                );

                servicioColaTrabajos.desencolar(trabajo);

                if (cargaActual.get() > 0) {
                    cargaActual.decrementAndGet();
                }
            }
        }

        for (Future<ResultadoProcesamientoDTO> futuro : futuros) {
            try {
                ResultadoProcesamientoDTO resultado = futuro.get();

                if (resultado != null) {
                    resultados.add(resultado);
                }
            } catch (Exception e) {
                e.printStackTrace();
                gestorLogs.error("Error obteniendo resultado procesado: " + e.getMessage());
            }
        }

        if (aceptados < trabajos.size()) {
            gestorLogs.warn(
                "No hubo capacidad suficiente en " + configuracionNodo.getIdNodo()
                + ". Aceptados: " + aceptados
                + ", rechazados: " + (trabajos.size() - aceptados)
            );
        }

        return resultados;
    }

    private ResultadoProcesamientoDTO procesarTrabajo(TrabajoImagenDTO trabajo) {
        long inicio = System.currentTimeMillis();

        ResultadoProcesamientoDTO resultado = new ResultadoProcesamientoDTO();
        resultado.setIdImagen(trabajo.getIdImagen());
        resultado.setIdNodo(configuracionNodo.getIdNodo());

        Long idNodoNumerico = obtenerIdNodoNumerico();

        try {
            System.out.println("DEBUG 1 - Iniciando procesamiento para imagen: " + trabajo.getIdImagen());

            imagenRepository.marcarProcesando(trabajo.getIdImagen(), idNodoNumerico);
            System.out.println("DEBUG 2 - Imagen marcada como PROCESANDO");

            registrarLogSeguro(
                trabajo.getIdImagen(),
                "INFO",
                "Procesamiento iniciado en " + configuracionNodo.getIdNodo()
            );

            BufferedImage imagen = imagenUtil.leerImagen(trabajo.getRutaOrigen());
            System.out.println("DEBUG 3 - Imagen leída desde ruta: " + trabajo.getRutaOrigen());

            if (trabajo.getTransformaciones() != null) {
                if (trabajo.getTransformaciones().size() > 5) {
                    throw new IllegalArgumentException("Cada imagen soporta máximo 5 transformaciones.");
                }

                for (TransformacionDTO transformacion : trabajo.getTransformaciones()) {
                    System.out.println("DEBUG 4 - Aplicando transformación: " + transformacion.getTipo());

                    ProcesadorImagen procesador =
                        fabricaProcesadores.obtenerProcesador(transformacion.getTipo());

                    imagen = procesador.procesar(imagen, transformacion.getValor());
                }
            }

            String nombreSalida = "resultado_" + trabajo.getIdImagen() + "_" + trabajo.getNombreArchivo();

            String rutaResultado = gestorAlmacenamiento.guardarResultado(
                imagen,
                configuracionNodo.getRutaAlmacenamiento(),
                nombreSalida
            );
            System.out.println("DEBUG 5 - Archivo resultado guardado en: " + rutaResultado);
            double tamanoArchivoKb = Files.size(Path.of(rutaResultado)) / 1024.0;

            long tiempo = System.currentTimeMillis() - inicio;

            resultado.setEstado("COMPLETADO");
            resultado.setMensaje("Imagen procesada correctamente.");
            resultado.setRutaResultado(rutaResultado);
            resultado.setTiempoProcesamientoMs(tiempo);

            resultadoRepository.guardar(
                trabajo.getIdImagen(),
                rutaResultado,
                obtenerFormatoSalida(trabajo.getNombreArchivo()),
                (double) tiempo,
                tamanoArchivoKb
            );
            System.out.println("DEBUG 6 - Insert en resultado_procesamiento realizado");

            imagenRepository.marcarProcesada(
                trabajo.getIdImagen(),
                rutaResultado,
                idNodoNumerico,
                tiempo
            );
            System.out.println("DEBUG 7 - Imagen marcada como PROCESADA");

            registrarLogSeguro(
                trabajo.getIdImagen(),
                "INFO",
                "Imagen procesada correctamente en " + configuracionNodo.getIdNodo()
            );
            System.out.println("DEBUG 8 - Insert en log_trabajo realizado");

            servicioMetricasNodo.registrarTrabajoCompletado(tiempo);

            gestorLogs.info(
                "Trabajo completado en " + configuracionNodo.getIdNodo()
                + ": " + trabajo.getNombreArchivo()
            );

            return resultado;

        } catch (Exception e) {
            long tiempo = System.currentTimeMillis() - inicio;

            e.printStackTrace();
            System.out.println("ERROR REAL procesando imagen " + trabajo.getIdImagen() + ": " + e.getMessage());

            resultado.setEstado("ERROR");
            resultado.setMensaje("Error procesando imagen: " + e.getMessage());
            resultado.setRutaResultado(null);
            resultado.setTiempoProcesamientoMs(tiempo);

            marcarErrorSeguro(trabajo.getIdImagen(), idNodoNumerico);

            registrarLogSeguro(
                trabajo.getIdImagen(),
                "ERROR",
                "Error en " + configuracionNodo.getIdNodo()
                + " con " + trabajo.getNombreArchivo()
                + ": " + e.getMessage()
            );

            servicioMetricasNodo.registrarTrabajoFallido();

            gestorLogs.error(
                "Error en " + configuracionNodo.getIdNodo()
                + " con " + trabajo.getNombreArchivo()
                + ": " + e.getMessage()
            );

            return resultado;

        } finally {
            servicioColaTrabajos.desencolar(trabajo);

            if (cargaActual.get() > 0) {
                cargaActual.decrementAndGet();
            }
        }
    }

    public EstadoNodoDTO obtenerEstadoNodo() {
        EstadoNodoDTO estado = new EstadoNodoDTO();
        estado.setIdNodo(configuracionNodo.getIdNodo());
        estado.setActivo(true);
        estado.setCapacidadMaxima(configuracionNodo.getCapacidadMaxima());
        estado.setCargaActual(cargaActual.get());
        estado.setCapacidadDisponible(configuracionNodo.getCapacidadMaxima() - cargaActual.get());
        estado.setHilosConfigurados(configuracionNodo.getCantidadHilos());
        return estado;
    }

    public List<TrabajoImagenDTO> obtenerTrabajosEnCola() {
        return new ArrayList<>(servicioColaTrabajos.listarTrabajos());
    }

    public MetricaNodoDTO obtenerMetricasNodo() {
        return servicioMetricasNodo.obtenerMetricas(cargaActual.get());
    }

    public void apagarNodo() {
        servicioEjecucionParalela.cerrar();
        gestorLogs.info("Nodo " + configuracionNodo.getIdNodo() + " apagado correctamente.");
    }

    private Long obtenerIdNodoNumerico() {
        String idNodo = configuracionNodo.getIdNodo();

        if (idNodo != null && idNodo.startsWith("nodo-")) {
            return Long.parseLong(idNodo.substring(5));
        }

        throw new IllegalStateException("Formato de idNodo inválido: " + idNodo);
    }

    private String obtenerFormatoSalida(String nombreArchivo) {
        if (nombreArchivo == null || !nombreArchivo.contains(".")) {
            return "JPG";
        }

        return nombreArchivo.substring(nombreArchivo.lastIndexOf('.') + 1).toUpperCase();
    }

    private void registrarLogSeguro(Long idImagen, String nivel, String mensaje) {
        try {
            if (idImagen != null) {
                logRepository.guardar(idImagen, nivel, mensaje);
            } else {
                System.err.println("No se pudo guardar log en BD porque idImagen es null. Mensaje: " + mensaje);
            }
        } catch (Exception e) {
            System.err.println("Error guardando log_trabajo: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void marcarErrorSeguro(Long idImagen, Long idNodoNumerico) {
        try {
            imagenRepository.marcarError(idImagen, idNodoNumerico);
        } catch (Exception e) {
            System.err.println("Error marcando imagen en estado ERROR: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
