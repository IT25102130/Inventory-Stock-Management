package src.main.java.com.inventory.controller;

import inventory.backend.dto.StockDTO;
import inventory.backend.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    // ==============================
    // READ ALL
    // ==============================
    @GetMapping
    public ResponseEntity<List<StockDTO>> getAllStock() {
        return ResponseEntity.ok(inventoryService.getAllStock());
    }

    // ==============================
    // READ ONE
    // ==============================
    @GetMapping("/{id}")
    public ResponseEntity<?> getStockById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(inventoryService.getStockById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Stock not found with ID: " + id);
        }
    }

    // ==============================
    // CREATE
    // ==============================
    @PostMapping
    public ResponseEntity<?> createStock(@RequestBody StockDTO stockDTO) {

        if (stockDTO.getProductId() == null || stockDTO.getQuantity() == null) {
            return ResponseEntity.badRequest().body("Product ID and Quantity are required");
        }

        if (stockDTO.getQuantity() <= 0) {
            return ResponseEntity.badRequest().body("Quantity must be greater than 0");
        }

        try {
            StockDTO createdStock = inventoryService.addStockByProductId(
                    stockDTO.getProductId(),
                    stockDTO.getQuantity()
            );
            return ResponseEntity.ok(createdStock);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create stock: " + e.getMessage());
        }
    }

    // ==============================
    // UPDATE
    // ==============================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStock(
            @PathVariable Long id,
            @RequestBody StockDTO stockDTO
    ) {

        if (stockDTO.getQuantity() == null || stockDTO.getQuantity() < 0) {
            return ResponseEntity.badRequest().body("Invalid quantity");
        }

        try {
            StockDTO updatedStock = inventoryService.updateStock(id, stockDTO);
            return ResponseEntity.ok(updatedStock);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update stock: " + e.getMessage());
        }
    }

    // ==============================
    // DELETE ✅ (NOW WORKS)
    // ==============================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStock(@PathVariable Long id) {

        try {
            inventoryService.deleteStock(id);
            return ResponseEntity.ok("Stock deleted successfully");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete stock: " + e.getMessage());
        }
    }
}
