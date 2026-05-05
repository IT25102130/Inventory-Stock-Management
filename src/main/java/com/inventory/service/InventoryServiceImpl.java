package src.main.java.com.inventory.service;

import inventory.backend.dto.StockDTO;
import inventory.backend.model.Stock;
import inventory.backend.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import product.backend.model.Product;
import product.backend.repository.ProductRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryServiceImpl implements InventoryService {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private ProductRepository productRepository;

    // ==============================
    // READ ALL STOCK
    // ==============================
    @Override
    public List<StockDTO> getAllStock() {
        return stockRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ==============================
    // READ STOCK BY ID
    // ==============================
    @Override
    public StockDTO getStockById(Long id) {
        Stock stock = stockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock not found with ID: " + id));

        return convertToDTO(stock);
    }

    // ==============================
    // CREATE STOCK (ADD / MERGE)
    // ==============================
    @Override
    @Transactional
    public StockDTO addStockByProductId(Long productId, Integer quantity) {

        // Validation
        if (productId == null) {
            throw new RuntimeException("Product ID is required");
        }

        if (quantity == null || quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        // Optional: Check if product exists
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));

        // Find existing stock OR create new
        Stock stock = stockRepository.findByProductId(productId)
                .orElse(new Stock());

        stock.setProductId(productId);

        // Add quantity (merge logic)
        int currentQty = (stock.getQuantity() != null) ? stock.getQuantity() : 0;
        stock.setQuantity(currentQty + quantity);

        stock.setLastUpdated(LocalDateTime.now());

        Stock savedStock = stockRepository.save(stock);

        return convertToDTO(savedStock);
    }

    // ==============================
    // UPDATE STOCK
    // ==============================
    @Override
    @Transactional
    public StockDTO updateStock(Long id, StockDTO stockDTO) {

        Stock stock = stockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock not found with ID: " + id));

        if (stockDTO.getQuantity() == null || stockDTO.getQuantity() < 0) {
            throw new RuntimeException("Invalid quantity");
        }

        if (stockDTO.getProductId() == null) {
            throw new RuntimeException("Product ID is required");
        }

        // Optional: Validate product exists
        productRepository.findById(stockDTO.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        stock.setProductId(stockDTO.getProductId());
        stock.setQuantity(stockDTO.getQuantity());
        stock.setLastUpdated(LocalDateTime.now());

        Stock updatedStock = stockRepository.save(stock);

        return convertToDTO(updatedStock);
    }

    // ==============================
    // DELETE STOCK
    // ==============================
    @Override
    @Transactional
    public void deleteStock(Long id) {

        Stock stock = stockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock not found with ID: " + id));

        stockRepository.delete(stock);
    }

    // ==============================
    // CONVERT ENTITY → DTO
    // ==============================
    private StockDTO convertToDTO(Stock stock) {

        StockDTO dto = new StockDTO();

        dto.setId(stock.getId());
        dto.setProductId(stock.getProductId());
        dto.setQuantity(stock.getQuantity());
        dto.setLastUpdated(stock.getLastUpdated());

        // Attach product name (for frontend display)
        if (stock.getProductId() != null) {
            Product product = productRepository.findById(stock.getProductId()).orElse(null);

            if (product != null) {
                dto.setProductName(product.getProductName());
            } else {
                dto.setProductName("Unknown Product");
            }
        }

        return dto;
    }
}
