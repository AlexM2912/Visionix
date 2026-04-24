package co.edu.upb;

import co.edu.upb.endpoint.ProcesamientoEndpoint;
import jakarta.xml.ws.Endpoint;

public class ApplicationServerMain {

    public static void main(String[] args) {
        String port = System.getenv("PORT");

        if (port == null || port.isBlank()) {
            port = "8080";
        }

        String url = "http://0.0.0.0:" + port + "/ws/procesamiento";

        Endpoint.publish(url, new ProcesamientoEndpoint());

        System.out.println("Application Server ejecutándose en: " + url + "?wsdl");
    }
}