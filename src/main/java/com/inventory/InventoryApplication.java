package src.main.java.com.inventory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = {
        "src.main.java.com.inventory"
})
@EntityScan(basePackages = {
        "src.main.java.com.inventory.model"
})
@EnableJpaRepositories(basePackages = {
        "src.main.java.com.inventory.repository"
})
public class InventoryApplication {
    public static void main(String[] args) {
        SpringApplication.run(InventoryApplication.class, args);
    }
}
