package src.main.java.com.inventory.service;

import inventory.backend.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import product.backend.model.Product;
import product.backend.repository.ProductRepository;
import supplier.backend.model.Supplier;
import supplier.backend.repository.SupplierRepository;
import transaction.backend.dto.TransactionDTO;
import transaction.backend.model.Transaction;
import transaction.backend.repository.TransactionRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionServiceImpl implements TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Override
    public List<TransactionDTO> getAllTransactions() {
        return transactionRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public TransactionDTO getTransactionById(Long id) {
        Transaction transaction = transactionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        return convertToDTO(transaction);
    }

    @Override
    @Transactional
    public TransactionDTO createTransaction(TransactionDTO transactionDTO) {
        Transaction transaction = new Transaction();
        transaction.setProductId(transactionDTO.getProductId());
        transaction.setSupplierId(transactionDTO.getSupplierId());
        transaction.setQuantity(transactionDTO.getQuantity());
        transaction.setTotalPrice(transactionDTO.getTotalPrice());
        transaction.setDate(LocalDateTime.now());
        
        transaction = transactionRepository.save(transaction);
        
        // Update Stock when transaction occurs
        inventoryService.addStockByProductId(transactionDTO.getProductId(), transactionDTO.getQuantity());
        
        return convertToDTO(transaction);
    }

    @Override
    @Transactional
    public TransactionDTO updateTransaction(Long id, TransactionDTO transactionDTO) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        // Calculate difference in quantity to update stock properly
        Integer oldQuantity = transaction.getQuantity();
        Integer newQuantity = transactionDTO.getQuantity();
        Integer quantityDifference = newQuantity - oldQuantity;
        
        transaction.setProductId(transactionDTO.getProductId());
        transaction.setSupplierId(transactionDTO.getSupplierId());
        transaction.setQuantity(newQuantity);
        transaction.setTotalPrice(transactionDTO.getTotalPrice());
        
        transaction = transactionRepository.save(transaction);
        
        if (quantityDifference != 0) {
            inventoryService.addStockByProductId(transactionDTO.getProductId(), quantityDifference);
        }
        
        return convertToDTO(transaction);
    }

    @Override
    @Transactional
    public void deleteTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id).orElse(null);
        if (transaction != null) {
            // Revert stock before deleting
            inventoryService.addStockByProductId(transaction.getProductId(), -transaction.getQuantity());
            transactionRepository.deleteById(id);
        }
    }

    private TransactionDTO convertToDTO(Transaction transaction) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setProductId(transaction.getProductId());
        dto.setSupplierId(transaction.getSupplierId());
        dto.setQuantity(transaction.getQuantity());
        dto.setTotalPrice(transaction.getTotalPrice());
        dto.setDate(transaction.getDate());
        
        if (transaction.getProductId() != null) {
            Product product = productRepository.findById(transaction.getProductId()).orElse(null);
            dto.setProductName(product != null ? product.getProductName() : "Unknown");
        }
        
        if (transaction.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(transaction.getSupplierId()).orElse(null);
            dto.setSupplierName(supplier != null ? supplier.getName() : "Unknown");
        }
        
        return dto;
    }
}
