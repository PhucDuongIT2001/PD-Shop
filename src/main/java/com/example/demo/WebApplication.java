package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Application entry point.
 *
 * @EnableAsync is required for AuditLogService.log() to actually run
 * asynchronously via @Async. Without this annotation, @Async methods
 * run synchronously in the same thread — silently defeating the purpose.
 *
 * The default task executor uses a cached thread pool. For production,
 * configure a custom ThreadPoolTaskExecutor bean with bounded queue depth
 * to prevent memory pressure under high audit log volume.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
@EnableAsync
public class WebApplication {
    public static void main(String[] args) {
        SpringApplication.run(WebApplication.class, args);
    }
}
