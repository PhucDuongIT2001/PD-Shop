package com.example.demo.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component

public class RateLimitFilter implements Filter {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    private Bucket createNewBucket() {
        // 5 requests per minute
        long capacity = 5;
        Refill refill = Refill.greedy(5, Duration.ofMinutes(1));
        Bandwidth limit = Bandwidth.classic(capacity, refill);
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket resolveBucket(String clientIp) {
        return cache.computeIfAbsent(clientIp, k -> createNewBucket());
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String path = request.getRequestURI();
        String method = request.getMethod();
        
        // Only rate limit POST requests to auth endpoints to prevent brute force
        if ("POST".equalsIgnoreCase(method) && 
            (path.startsWith("/login") || path.startsWith("/register") || path.startsWith("/api/auth"))) {
            String clientIp = request.getRemoteAddr();
            Bucket bucket = resolveBucket(clientIp);

            if (bucket.tryConsume(1)) {
                filterChain.doFilter(request, response);
            } else {
                if (path.startsWith("/api/")) {
                    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                    response.setContentType("application/json; charset=UTF-8");
                    response.getWriter().write("{\"success\": false, \"message\": \"Quá nhiều yêu cầu đăng nhập/đăng ký. Vui lòng thử lại sau.\", \"status\": 429}");
                } else {
                    response.sendRedirect(path + "?error=ratelimit");
                }
            }
        } else {
            filterChain.doFilter(request, response);
        }
    }
}
