package co.edu.upb.processor;

public class FabricaProcesadores {

    public ProcesadorImagen obtenerProcesador(String tipo) {
        if (tipo == null) {
            throw new IllegalArgumentException("El tipo de transformación no puede ser nulo.");
        }

        return switch (tipo.toUpperCase()) {
            case "ESCALA_GRISES" -> new ProcesadorEscalaGrises();
            case "ROTAR" -> new ProcesadorRotar();
            case "REDIMENSIONAR" -> new ProcesadorRedimensionar();
            case "RECORTAR" -> new ProcesadorRecortar();
            case "REFLEJAR" -> new ProcesadorReflejar();
            case "DESENFOCAR" -> new ProcesadorDesenfocar();
            case "PERFILAR" -> new ProcesadorPerfilar();
            case "BRILLO_CONTRASTE" -> new ProcesadorBrilloContraste();
            case "MARCA_AGUA_TEXTO" -> new ProcesadorMarcaAguaTexto();
            case "CONVERSION_FORMATO" -> new ProcesadorConversionFormato();
            default -> throw new IllegalArgumentException("Transformación no soportada: " + tipo);
        };
    }
}