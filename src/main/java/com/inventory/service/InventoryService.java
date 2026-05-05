package src.main.java.com.inventory.service;

import src.main.java.com.inventory.dto.StockDTO;

import java.util.List;

public interface InventoryService {

    // ==============================
    // READ ALL STOCK
    // ==============================
    List<StockDTO> getAllStock();

    // ==============================
    // READ STOCK BY ID
    // ==============================
    StockDTO getStockById(Long id);

    // ==============================
    // CREATE STOCK (ADD / MERGE)
    // ==============================
    StockDTO addStockByProductId(Long productId, Integer quantity);

    // ==============================
    // UPDATE STOCK
    // ==============================
    StockDTO updateStock(Long id, StockDTO stockDTO);

    // ==============================
    // DELETE STOCK
    // ==============================
    void deleteStock(Long id);
}
