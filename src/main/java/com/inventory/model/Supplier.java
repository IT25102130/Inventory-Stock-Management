package src.main.java.com.inventory.model;

import src.main.java.com.inventory.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "suppliers_vendors")
public class Supplier extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column
    private String contact;

    @Column(columnDefinition = "TEXT")
    private String address;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
