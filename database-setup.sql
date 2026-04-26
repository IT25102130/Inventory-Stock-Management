-- Create Database
CREATE DATABASE IF NOT EXISTS inventory_system;
USE inventory_system;

-- Table: users_roles
CREATE TABLE IF NOT EXISTS users_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: login_users
CREATE TABLE IF NOT EXISTS login_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES users_roles(id) ON DELETE SET NULL
);

-- Table: products_categories
CREATE TABLE IF NOT EXISTS products_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: inventory_stock
CREATE TABLE IF NOT EXISTS inventory_stock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products_categories(id) ON DELETE CASCADE
);

-- Table: suppliers_vendors
CREATE TABLE IF NOT EXISTS suppliers_vendors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: transactions_orders
CREATE TABLE IF NOT EXISTS transactions_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers_vendors(id) ON DELETE CASCADE
);

-- Insert Sample Data
INSERT INTO users_roles (role_name) VALUES ('ADMIN'), ('MANAGER'), ('STAFF') ON DUPLICATE KEY UPDATE role_name=role_name;

INSERT INTO login_users (username, password, role_id) VALUES 
('admin', 'admin123', 1),
('manager', 'manager123', 2)
ON DUPLICATE KEY UPDATE username=username;

INSERT INTO products_categories (product_name, category_name, price) VALUES 
('Laptop', 'Electronics', 1200.00),
('Desk', 'Furniture', 150.00)
ON DUPLICATE KEY UPDATE product_name=product_name;

INSERT INTO inventory_stock (product_id, quantity) VALUES 
(1, 50),
(2, 20)
ON DUPLICATE KEY UPDATE product_id=product_id;

INSERT INTO suppliers_vendors (name, contact, address) VALUES 
('Tech Supplies Co.', 'contact@techsupplies.com', '123 Tech Park, NY'),
('Office Furnishings', 'sales@officefurn.com', '456 Business Rd, CA')
ON DUPLICATE KEY UPDATE name=name;
