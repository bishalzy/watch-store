package com.watchstore.server.config;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Value("${client.url:http://localhost:5173}")
    private String clientUrl;

    private List<String> getAllowedOriginPatterns() {
        List<String> patterns = new ArrayList<>(Arrays.asList(
            "http://localhost:5173",
            "http://localhost:*",
            "http://127.0.0.1:*",
            "https://*.railway.app",
            "https://*.vercel.app",
            "https://*.netlify.app"
        ));

        if (clientUrl != null && !clientUrl.isBlank()) {
            for (String url : clientUrl.split(",")) {
                String trimmed = url.trim();
                if (!trimmed.isEmpty() && !patterns.contains(trimmed)) {
                    patterns.add(trimmed);
                }
            }
        }
        return patterns;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(getAllowedOriginPatterns());
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Set-Cookie", "Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                List<String> patterns = getAllowedOriginPatterns();
                registry.addMapping("/**")
                        .allowedOriginPatterns(patterns.toArray(new String[0]))
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("*")
                        .exposedHeaders("Set-Cookie", "Authorization")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }
}
