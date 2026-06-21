package com.example.demo.config;

import org.springframework.boot.web.server.MimeMappings;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
        String uploadLocations = uploadDir.toUri().toString();
        if (!uploadLocations.endsWith("/")) {
            uploadLocations += "/";
        }
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocations);
    }

    @Bean
    public WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> mimeTypeCustomizer() {
        return factory -> {
            MimeMappings mappings = new MimeMappings(MimeMappings.DEFAULT);
            mappings.add("glb", "model/gltf-binary");
            mappings.add("usdz", "model/vnd.usdz+zip");
            factory.setMimeMappings(mappings);
        };
    }
}
