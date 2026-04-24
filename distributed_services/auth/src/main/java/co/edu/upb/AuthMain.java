package co.edu.upb;

import co.edu.upb.config.AppConfig;
import co.edu.upb.controller.AuthController;
import static spark.Spark.ipAddress;
import static spark.Spark.port;

public class AuthMain {

    public static void main(String[] args) {
        String portEnv = System.getenv("PORT");

        int serverPort = portEnv != null && !portEnv.isBlank()
                ? Integer.parseInt(portEnv)
                : AppConfig.getInt("server.port");

        ipAddress("::");
        port(serverPort);

        AuthController authController = new AuthController();
        authController.registrarRutas();

        System.out.println("Auth service corriendo en puerto: " + serverPort);
    }
}