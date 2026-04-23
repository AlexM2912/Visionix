package co.edu.upb.util;

import org.mindrot.jbcrypt.BCrypt;

public class PasswordUtil {

    public static String hashPassword(String passwordPlano) {
        return BCrypt.hashpw(passwordPlano, BCrypt.gensalt());
    }

    public static boolean verificarPassword(String passwordPlano, String hash) {
        return BCrypt.checkpw(passwordPlano, hash);
    }
}