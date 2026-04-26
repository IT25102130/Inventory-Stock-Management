package com.inventory.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve login frontend
        registry.addResourceHandler("/login/**")
                .addResourceLocations("file:login/frontend/");

        // Serve user frontend
        registry.addResourceHandler("/user/**")
                .addResourceLocations("file:user/frontend/");

        // Serve product frontend
        registry.addResourceHandler("/product/**")
                .addResourceLocations("file:product/frontend/");

        // Serve inventory frontend
        registry.addResourceHandler("/inventory/**")
                .addResourceLocations("file:inventory/frontend/");

        // Serve supplier frontend
        registry.addResourceHandler("/supplier/**")
                .addResourceLocations("file:supplier/frontend/");

        // Serve transaction frontend
        registry.addResourceHandler("/transaction/**")
                .addResourceLocations("file:transaction/frontend/");
    }
}
