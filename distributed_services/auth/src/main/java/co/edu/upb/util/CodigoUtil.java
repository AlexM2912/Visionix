package co.edu.upb.util;

import java.security.SecureRandom;

public class CodigoUtil {

    private static final SecureRandom random = new SecureRandom();

    public static String generarCodigo6Digitos() {
        int numero = 100000 + random.nextInt(900000);
        return String.valueOf(numero);
    }
}