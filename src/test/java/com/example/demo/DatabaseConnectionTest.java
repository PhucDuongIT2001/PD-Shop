package com.example.demo;

import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
public class DatabaseConnectionTest {

    @Autowired
    private DataSource dataSource;

    @Test
    void testConnection() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            System.out.println("--- KẾT NỐI THÀNH CÔNG ĐẾN: " + connection.getMetaData().getURL());
            assertThat(connection.isValid(5)).isTrue();
        }
    }
}
