package co.edu.upb.log;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GestorLogs {

    private static final Logger logger = LoggerFactory.getLogger(GestorLogs.class);

    public void info(String mensaje) {
        logger.info(mensaje);
    }

    public void error(String mensaje) {
        logger.error(mensaje);
    }

    public void warn(String mensaje) {
        logger.warn(mensaje);
    }
}