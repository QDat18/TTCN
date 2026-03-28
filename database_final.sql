-- =========================
-- CREATE DATABASE
-- =========================
CREATE DATABASE IF NOT EXISTS phela_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE phela_db;

-- =========================
-- CUSTOMER
-- =========================
CREATE TABLE customer (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_code VARCHAR(50) UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender VARCHAR(10),
    latitude DOUBLE,
    longitude DOUBLE,
    failed_login_attempts INT DEFAULT 0,
    order_cancel_times INT DEFAULT 0,
    point_use INT DEFAULT 0,
    role VARCHAR(20),
    status VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- ADMIN
-- =========================
CREATE TABLE admin (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employ_code VARCHAR(50) UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(100),
    phone VARCHAR(20),
    dob DATE,
    gender VARCHAR(10),
    last_login_ip VARCHAR(50),
    failed_login_attempts INT DEFAULT 0,
    role VARCHAR(20),
    status VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- VERIFICATION TOKEN
-- =========================
CREATE TABLE verification_token (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    expiry_date DATETIME NOT NULL,
    customer_id BIGINT,
    FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE
);

-- =========================
-- ADDRESS (GIỮ NGUYÊN)
-- =========================
CREATE TABLE address (
    address_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT,
    recipient_name VARCHAR(100),
    phone VARCHAR(20),
    detailed_address VARCHAR(255),
    ward VARCHAR(100),
    district VARCHAR(100),
    city VARCHAR(100),
    latitude DOUBLE,
    longitude DOUBLE,
    is_default BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE
);

-- =========================
-- CATEGORY
-- =========================
CREATE TABLE category (
    category_code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    category_name VARCHAR(100),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- PRODUCT
-- =========================
CREATE TABLE product (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE,
    product_name VARCHAR(150),
    description TEXT,
    image_url VARCHAR(255),
    original_price DECIMAL(10,2),
    status VARCHAR(20),
    category_code VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_code) REFERENCES category(category_code)
);

-- =========================
-- PRODUCT SIZE (NEW)
-- =========================
CREATE TABLE product_size (
    product_size_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT,
    size_name VARCHAR(50), -- PHÊ, LA, etc.
    price DECIMAL(10,2),
    FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
);

-- =========================
-- BRANCH
-- =========================
CREATE TABLE branch (
    branch_code VARCHAR(50) PRIMARY KEY,
    branch_name VARCHAR(150),
    address VARCHAR(255),
    district VARCHAR(100),
    city VARCHAR(100),
    latitude DOUBLE,
    longtitude DOUBLE,
    status VARCHAR(20)
);

-- =========================
-- CART (HEADER)
-- =========================
CREATE TABLE cart (
    cart_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- =========================
-- CART ITEM (3NF)
-- =========================
CREATE TABLE cart_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT,
    product_id BIGINT,
    product_size_id BIGINT,
    quantity INT NOT NULL,
    note VARCHAR(255),
    FOREIGN KEY (cart_id) REFERENCES cart(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(product_id),
    FOREIGN KEY (product_size_id) REFERENCES product_size(product_size_id)
);

-- =========================
-- PROMOTION
-- =========================
CREATE TABLE promotion (
    promotion_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    promotion_code VARCHAR(50) UNIQUE,
    name VARCHAR(150),
    description TEXT,
    discount_value DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    min_order_amount DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    applied_at DATE,
    status VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- ORDERS (HEADER)
-- =========================
CREATE TABLE orders (
    order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(50) UNIQUE,
    customer_id BIGINT,
    branch_code VARCHAR(50),
    order_date DATETIME,
    delivery_date DATETIME,
    shipping_fee DECIMAL(10,2),
    final_amount DECIMAL(10,2),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    status VARCHAR(50),
    note VARCHAR(255),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(id),
    FOREIGN KEY (branch_code) REFERENCES branch(branch_code)
);

-- =========================
-- ORDER DETAIL (3NF)
-- =========================
CREATE TABLE order_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT,
    product_id BIGINT,
    product_size_id BIGINT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(product_id),
    FOREIGN KEY (product_size_id) REFERENCES product_size(product_size_id)
);

-- =========================
-- USER BEHAVIOR (AI / LOG)
-- =========================
CREATE TABLE user_behavior (
    behavior_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT,
    product_id BIGINT,
    action_type VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(id),
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);

-- =========================
-- FEEDBACK
-- =========================
CREATE TABLE feedback (
    feedback_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT,
    order_id BIGINT,
    rating INT,
    content TEXT,
    status VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- =========================
-- INDEX (PERFORMANCE)
-- =========================
CREATE INDEX idx_product_name ON product(product_name);
CREATE INDEX idx_order_date ON orders(order_date);
CREATE INDEX idx_behavior_customer ON user_behavior(customer_id);
