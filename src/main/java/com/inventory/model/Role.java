package src.main.java.com.inventory.model;

import src.main.java.com.inventory.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "users_roles")
public class Role extends BaseEntity {

    @Column(name = "role_name", nullable = false, unique = true)
    private String roleName;

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
}
