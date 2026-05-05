package src.main.java.com.inventory.model;

import src.main.java.com.inventory.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "products_categories")
public class Product extends BaseEntity {

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "category_name", nullable = false)
    private String categoryName;

    @Column(nullable = false)
    private Double price;

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
}
