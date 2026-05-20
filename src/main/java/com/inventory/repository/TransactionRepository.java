package transaction.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import transaction.backend.model.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
}
