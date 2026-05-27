package com.example.demo.config;

import com.example.demo.security.RateLimitFilter;
import com.example.demo.security.jwt.AuthTokenFilter;
import com.example.demo.service.CustomOAuth2UserService;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final ObjectProvider<AuthTokenFilter> authTokenFilterProvider;
    private final ObjectProvider<RateLimitFilter> rateLimitFilterProvider;
    private final CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler;
    private final CustomOAuth2UserService customOAuth2UserService;

    public SecurityConfig(ObjectProvider<AuthTokenFilter> authTokenFilterProvider,
                          ObjectProvider<RateLimitFilter> rateLimitFilterProvider,
                          CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler,
                          CustomOAuth2UserService customOAuth2UserService) {
        this.authTokenFilterProvider = authTokenFilterProvider;
        this.rateLimitFilterProvider = rateLimitFilterProvider;
        this.customAuthenticationSuccessHandler = customAuthenticationSuccessHandler;
        this.customOAuth2UserService = customOAuth2UserService;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true);
                return config;
            }))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, authException) -> {
                response.sendError(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            }))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/oauth2/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories", "/api/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/brands", "/api/brands/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/orders/track").permitAll()
                .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "MANAGER", "STAFF")
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
                .successHandler(customAuthenticationSuccessHandler)
            );

        rateLimitFilterProvider.ifAvailable(f ->
            http.addFilterBefore(f, UsernamePasswordAuthenticationFilter.class));
        authTokenFilterProvider.ifAvailable(f ->
            http.addFilterBefore(f, UsernamePasswordAuthenticationFilter.class));

        return http.build();
    }
}
