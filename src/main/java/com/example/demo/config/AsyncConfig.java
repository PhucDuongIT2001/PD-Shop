package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AsyncConfig {
    // Basic async configuration using Spring's default SimpleAsyncTaskExecutor.
    // For production, you might want to configure a ThreadPoolTaskExecutor here.
}
