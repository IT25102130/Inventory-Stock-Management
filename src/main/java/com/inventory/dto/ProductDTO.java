package src.main.java.com.inventory.dto;

public class ProductDTO {
    private Long id;
    private String productName;
    private String categoryName;
    private Double price;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
}
