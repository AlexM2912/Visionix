package co.edu.upb.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConfig {

    private static final String URL = AppConfig.get("db.url");
    private static final String USER = AppConfig.get("db.user");
    private static final String PASSWORD = AppConfig.get("db.password");

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}