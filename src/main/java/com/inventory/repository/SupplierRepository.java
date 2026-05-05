package src.main.java.com.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import supplier.backend.model.Supplier;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
}
