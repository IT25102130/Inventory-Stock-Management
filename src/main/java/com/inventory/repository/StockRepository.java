package src.main.java.com.inventory.repository;

import inventory.backend.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    // ==============================
    // FIND STOCK BY PRODUCT ID
    // ==============================
    Optional<Stock> findByProductId(Long productId);

    // ==============================
    // CHECK IF STOCK EXISTS FOR PRODUCT
    // ==============================
    boolean existsByProductId(Long productId);

    // ==============================
    // GET ALL LOW STOCK (OPTIONAL FEATURE)
    // ==============================
    List<Stock> findByQuantityLessThan(Integer quantity);
}
