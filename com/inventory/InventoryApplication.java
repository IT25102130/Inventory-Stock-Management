package com.inventory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = {
    "com.inventory",
    "login.backend",
    "user.backend",
    "product.backend",
    "inventory.backend",
    "supplier.backend",
    "transaction.backend"
})
@EntityScan(basePackages = {
    "common.backend.model",
    "user.backend.model",
    "product.backend.model",
    "inventory.backend.model",
    "supplier.backend.model",
    "transaction.backend.model"
})
@EnableJpaRepositories(basePackages = {
    "user.backend.repository",
    "product.backend.repository",
    "inventory.backend.repository",
    "supplier.backend.repository",
    "transaction.backend.repository"
})
public class InventoryApplication {
    public static void main(String[] args) {
        SpringApplication.run(InventoryApplication.class, args);
    }
}
