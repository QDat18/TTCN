-- =========================
-- SEED DATA FOR PHELĂ
-- =========================

-- 1. BRANCH
INSERT INTO branch (branch_code, branch_name, address, district, city, latitude, longitude, status)
VALUES ('BR001', 'Phê La Đặng Tiến Đông', 'Số 24 Đặng Tiến Đông', 'Đống Đa', 'Hà Nội', 21.0123, 105.8234, 1);

-- 2. ADMIN (username: admin, password: admin123)
INSERT INTO admin (id, employ_code, username, email, password, fullname, phone, dob, gender, role, status, branch_code)
VALUES ('admin-uuid-001', 'EMP001', 'admin', 'admin@phela.com', '$2b$10$JzSUtEJ6Twq6BvcgRXwe5urMNKWxkGcLyLsw0FxgBHHYdb0yGEU.G', 'Administrator', '0987654321', '1990-01-01', 'MALE', 'ADMIN', 'ACTIVE', 'BR001');

-- 2b. CUSTOMER (username: customer, password: customer123)
INSERT INTO customer (id, customer_code, username, email, password, gender, role, status)
VALUES ('cust-uuid-001', 'CUS001', 'customer', 'customer@phela.com', '$2b$10$bFdanVMByU8wZd.kWWWzpeHWvUTpnuSgJCi3R144nfoWpLx7wbLOa', 'MALE', 'CUSTOMER', 'ACTIVE');

-- 3. CATEGORY
INSERT INTO category (category_code, category_name, description) VALUES
('CF', 'Cà Phê', 'Các loại cà phê đậm đà hương vị'),
('TEA', 'Trà', 'Trà nguyên bản và trà sữa'),
('SYND', 'Sản Phẩm Đóng Gói', 'Trà và cà phê đóng gói mang về');

-- 4. PRODUCT
INSERT INTO product (product_id, product_code, product_name, description, image_url, original_price, status, category_code)
VALUES ('prod-uuid-001', 'PROD001', 'Trà Sữa Phê La', 'Trà sữa đậm vị trà, quyện cùng sữa béo ngậy', 'https://phela.vn/wp-content/uploads/2021/08/Tra-Sua-Phe-La-1.jpg', 55000, 1, 'TEA');
INSERT INTO product (product_id, product_code, product_name, description, image_url, original_price, status, category_code)
VALUES ('prod-uuid-002', 'PROD002', 'Cà Phê Muối', 'Cà phê muối đặc sản', 'https://phela.vn/wp-content/uploads/2021/08/Ca-Phe-Muoi.jpg', 45000, 1, 'CF');

-- 5. BANNER (Active)
INSERT INTO banner (banner_id, image_url, status) VALUES
('b1', 'https://phela.vn/wp-content/uploads/2023/12/Website-banner-desk-1.jpg', 'ACTIVE'),
('b2', 'https://phela.vn/wp-content/uploads/2023/12/Website-banner-desk-2.jpg', 'ACTIVE'),
('b3', 'https://phela.vn/wp-content/uploads/2023/12/Website-banner-desk-3.jpg', 'INACTIVE');

-- 6. NEWS
INSERT INTO news (news_id, title, summary, content, thumbnail_url)
VALUES ('news-uuid-001', 'Khai trương chi nhánh mới', 'Phê La chính thức có mặt tại Đống Đa', 'Nội dung chi tiết về buổi khai trương...', 'https://phela.vn/wp-content/uploads/2021/08/Khai-truong.jpg');

-- 7. PROMOTION
INSERT INTO promotion (promotion_id, promotion_code, name, description, discount_type, discount_value, start_date, end_date, status)
VALUES ('prom-uuid-001', 'WELCOME10', 'Chào mừng khách hàng mới', 'Giảm 10% cho đơn hàng đầu tiên', 'PERCENTAGE', 10, '2024-01-01 00:00:00', '2025-01-01 23:59:59', 'ACTIVE');
