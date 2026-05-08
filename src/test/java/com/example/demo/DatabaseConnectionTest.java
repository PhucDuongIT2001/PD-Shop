package com.example.demo;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import org.junit.jupiter.api.Test;

public class DatabaseConnectionTest {

    @Test
    void testConnection() {
        String url = "jdbc:mysql://localhost:3306/PD_SHOP?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        String user = "root";
        String password = "123456";

        try (Connection connection = DriverManager.getConnection(url, user, password)) {
            System.out.println("--- KẾT NỐI THÀNH CÔNG ĐẾN: " + connection.getMetaData().getURL());
            assert connection.isValid(5);
        } catch (SQLException e) {
            System.err.println("--- KẾT NỐI THẤT BẠI ---");
            e.printStackTrace();
            assert false;
        }
    }
}
