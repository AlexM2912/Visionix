package co.edu.upb;

import co.edu.upb.endpoint.ProcesamientoEndpoint;
import jakarta.xml.ws.Endpoint;

public class ApplicationServerMain {

    public static void main(String[] args) {
        String url = "http://localhost:8080/ws/procesamiento";
        Endpoint.publish(url, new ProcesamientoEndpoint());
        System.out.println("Application Server ejecutándose en: " + url + "?wsdl");
    }
}