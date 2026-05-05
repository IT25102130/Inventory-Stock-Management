package src.main.java.com.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import src.main.java.com.inventory.model.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
}
