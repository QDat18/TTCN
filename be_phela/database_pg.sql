-- =========================
-- CUSTOMER
-- =========================
CREATE TABLE customer (
    id VARCHAR(36) PRIMARY KEY,
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    failed_login_attempts INT DEFAULT 0,
    point_use DOUBLE PRECISION DEFAULT 0.0,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- BRANCH
-- =========================
CREATE TABLE branch (
    branch_code VARCHAR(50) PRIMARY KEY,
    branch_name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status SMALLINT -- ProductStatus ordinal
);

-- =========================
-- ADMIN
-- =========================
CREATE TABLE admin (
    id VARCHAR(36) PRIMARY KEY,
    employ_code VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    dob DATE,
    gender VARCHAR(10) NOT NULL,
    last_login_ip VARCHAR(45),
    failed_login_attempts INT DEFAULT 0,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    branch_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_branch FOREIGN KEY (branch_code) REFERENCES branch(branch_code)
);

-- =========================
-- VERIFICATION TOKENS
-- =========================
CREATE TABLE verification_tokens (
    id VARCHAR(36) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    expiry_date TIMESTAMP,
    customer_id VARCHAR(36),
    admin_id VARCHAR(36),
    CONSTRAINT fk_verif_customer FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE,
    CONSTRAINT fk_verif_admin FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE
);

-- =========================
-- PASSWORD RESET TOKENS
-- =========================
CREATE TABLE password_reset_tokens (
    id VARCHAR(36) PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    expiry_date TIMESTAMP NOT NULL
);

-- =========================
-- ADDRESS
-- =========================
CREATE TABLE address (
    address_id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    detailed_address VARCHAR(255) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_default BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_address_customer FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE
);

-- =========================
-- CATEGORY
-- =========================
CREATE TABLE category (
    category_code VARCHAR(100) PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- PRODUCT
-- =========================
CREATE TABLE product (
    product_id VARCHAR(36) PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    original_price DOUBLE PRECISION NOT NULL,
    status SMALLINT, -- ProductStatus ordinal
    category_code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category FOREIGN KEY (category_code) REFERENCES category(category_code)
);

-- =========================
-- PRODUCT SIZE (NEW)
-- =========================
CREATE TABLE product_size (
    product_size_id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    size_name VARCHAR(50) NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    CONSTRAINT fk_size_product FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
);

-- =========================
-- CART
-- =========================
CREATE TABLE cart (
    cart_id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL UNIQUE,
    address_id VARCHAR(36),
    branch_code VARCHAR(50),
    total_amount DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_customer FOREIGN KEY (customer_id) REFERENCES customer(id),
    CONSTRAINT fk_cart_address FOREIGN KEY (address_id) REFERENCES address(address_id)
);

-- =========================
-- CART ITEM
-- =========================
CREATE TABLE cart_item (
    cart_item_id VARCHAR(36) PRIMARY KEY,
    cart_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    product_size_id VARCHAR(36),
    quantity INT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    note VARCHAR(255),
    CONSTRAINT fk_item_cart FOREIGN KEY (cart_id) REFERENCES cart(cart_id) ON DELETE CASCADE,
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES product(product_id),
    CONSTRAINT fk_item_size FOREIGN KEY (product_size_id) REFERENCES product_size(product_size_id)
);

-- =========================
-- PROMOTION
-- =========================
CREATE TABLE promotion (
    promotion_id VARCHAR(36) PRIMARY KEY,
    promotion_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(50) NOT NULL,
    discount_value DOUBLE PRECISION NOT NULL,
    minimum_order_amount DOUBLE PRECISION,
    max_discount_amount DOUBLE PRECISION,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- PROMOTION CART
-- =========================
CREATE TABLE promotion_cart (
    promotion_cart_id BIGSERIAL PRIMARY KEY,
    promotion_id VARCHAR(36) NOT NULL,
    cart_id VARCHAR(36) NOT NULL,
    discount_amount DOUBLE PRECISION NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prom_cart_promo FOREIGN KEY (promotion_id) REFERENCES promotion(promotion_id),
    CONSTRAINT fk_prom_cart_cart FOREIGN KEY (cart_id) REFERENCES cart(cart_id)
);

-- =========================
-- ORDERS
-- =========================
CREATE TABLE orders (
    order_id VARCHAR(36) PRIMARY KEY,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(36) NOT NULL,
    address_id VARCHAR(36),
    branch_code VARCHAR(50),
    status VARCHAR(50) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_date TIMESTAMP,
    shipping_fee DOUBLE PRECISION NOT NULL,
    total_amount DOUBLE PRECISION NOT NULL,
    total_discount DOUBLE PRECISION,
    final_amount DOUBLE PRECISION NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES customer(id),
    CONSTRAINT fk_order_address FOREIGN KEY (address_id) REFERENCES address(address_id),
    CONSTRAINT fk_order_branch FOREIGN KEY (branch_code) REFERENCES branch(branch_code)
);

-- =========================
-- ORDER ITEM
-- =========================
CREATE TABLE order_item (
    order_item_id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    product_size_id VARCHAR(36),
    quantity INT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    note VARCHAR(255),
    CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_item_product_order FOREIGN KEY (product_id) REFERENCES product(product_id),
    CONSTRAINT fk_item_size_order FOREIGN KEY (product_size_id) REFERENCES product_size(product_size_id)
);

-- =========================
-- JOB POSTING
-- =========================
CREATE TABLE job_posting (
    job_posting_id VARCHAR(36) PRIMARY KEY,
    job_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    salary_range VARCHAR(255),
    experience_level VARCHAR(50) NOT NULL,
    branch_code VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    posting_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline DATE NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_branch FOREIGN KEY (branch_code) REFERENCES branch(branch_code)
);

-- =========================
-- APPLICATION
-- =========================
CREATE TABLE application (
    application_id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    cv_url VARCHAR(255),
    job_posting_id VARCHAR(36) NOT NULL,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    CONSTRAINT fk_app_job FOREIGN KEY (job_posting_id) REFERENCES job_posting(job_posting_id) ON DELETE CASCADE
);

-- =========================
-- USER BEHAVIOR
-- =========================
CREATE TABLE user_behavior (
    behavior_id BIGSERIAL PRIMARY KEY,
    customer_id VARCHAR(36),
    product_id VARCHAR(36),
    action_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_behavior_customer FOREIGN KEY (customer_id) REFERENCES customer(id),
    CONSTRAINT fk_behavior_product FOREIGN KEY (product_id) REFERENCES product(product_id)
);

-- =========================
-- FEEDBACK
-- =========================
CREATE TABLE feedback (
    feedback_id BIGSERIAL PRIMARY KEY,
    customer_id VARCHAR(36),
    order_id VARCHAR(36),
    rating INT,
    content TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_customer FOREIGN KEY (customer_id) REFERENCES customer(id),
    CONSTRAINT fk_feedback_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- =========================
-- INDEX (PERFORMANCE)
-- =========================
CREATE INDEX idx_product_name ON product(product_name);
CREATE INDEX idx_order_date ON orders(order_date);
CREATE INDEX idx_behavior_customer ON user_behavior(customer_id);

-- =========================
-- BANNER
-- =========================
CREATE TABLE banner (
    banner_id VARCHAR(36) PRIMARY KEY,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL
);

-- =========================
-- NEWS
-- =========================
CREATE TABLE news (
    news_id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT,
    thumbnail_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- CONTACT
-- =========================
CREATE TABLE contact (
    contact_id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- CHAT MESSAGE
-- =========================
CREATE TABLE chat_message (
    id VARCHAR(36) PRIMARY KEY,
    content TEXT,
    sender_id VARCHAR(36),
    recipient_id VARCHAR(36),
    sender_name VARCHAR(255),
    timestamp TIMESTAMP,
    image_url VARCHAR(255)
);
