package co.edu.upb;

import co.edu.upb.config.AppConfig;
import co.edu.upb.controller.AuthController;
import static spark.Spark.port;

public class AuthMain {

    public static void main(String[] args) {
        int serverPort = AppConfig.getInt("server.port");
        port(serverPort);

        AuthController authController = new AuthController();
        authController.registrarRutas();

        System.out.println("Auth service corriendo en http://localhost:" + serverPort);
    }
}