package com.pivik.finance_dashboard.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Allow everything from the frontend
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173",
                    "http://pivik-frontend-tabo.s3-website-us-east-1.amazonaws.com"
                ) 
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
                
    }
}