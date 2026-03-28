package com.example.be_phela.config;

import com.example.be_phela.model.*;
import com.example.be_phela.model.enums.ProductStatus;
import com.example.be_phela.model.enums.Roles;
import com.example.be_phela.model.enums.Status;
import com.example.be_phela.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final AdminRepository adminRepository;
    private final CustomerRepository customerRepository;
    private final ProductSizeRepository productSizeRepository;
    private final CartRepository cartRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            log.info("--- Database Status ---");
            log.info("Categories: {}", categoryRepository.count());
            log.info("Products: {}", productRepository.count());
            log.info("Product Sizes: {}", productSizeRepository.count());
            log.info("Admins: {}", adminRepository.count());
            log.info("Customers: {}", customerRepository.count());
            log.info("-----------------------");

            // Seed categories
            log.info("Seeding categories...");
            seedCategories();

            // Seed products
            log.info("Seeding products...");
            seedProducts();

            // Seed product sizes
            log.info("Seeding product sizes...");
            seedProductSizes();

            // Seed default users
            if (adminRepository.count() == 0 || customerRepository.count() == 0) {
                log.info("Seeding default users...");
                seedUsers();
            }
            
            log.info("Data seeding completed. Total products: {}, Total sizes: {}", 
                productRepository.count(), productSizeRepository.count());
        };
    }

    private void seedCategories() {
        Object[][] categories = {
            {"SIGNATURE", "Signature", "Dòng sản phẩm đặc trưng nhất của Phê La"},
            {"COFFEE", "Cà Phê", "Các loại cà phê Phê La"},
            {"TEA", "Ô Long & Matcha", "Trà ô long và Matcha đặc sản"},
            {"COLD_BREW", "Cold Brew", "Cà phê ủ lạnh"},
            {"SYPHON", "Syphon", "Trà Ô Long pha bằng bình Syphon"},
            {"FRENCH_PRESS", "French Press", "Trà Ô Long pha bằng bình French Press"},
            {"MOKA_POT", "Moka Pot", "Trà Ô Long pha bằng bình Moka Pot"},
            {"PLUS", "Phe La Plus", "Dòng sản phẩm đóng chai/lon tiện lợi"},
            {"TOPPING", "Topping", "Các loại trân châu và topping"}
        };

        for (Object[] cat : categories) {
            String code = (String) cat[0];
            String name = (String) cat[1];
            String desc = (String) cat[2];
            
            Category category = categoryRepository.findByCategoryCode(code)
                .orElse(new Category());
            category.setCategoryCode(code);
            category.setCategoryName(name);
            category.setDescription(desc);
            categoryRepository.save(category);
        }
    }

    private void seedUsers() {
        if (adminRepository.findByUsername("admin").isEmpty()) {
            Admin admin = Admin.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .fullname("System Admin")
                    .email("admin@phela.vn")
                    .phone("0987654321")
                    .gender("Nam")
                    .role(Roles.ADMIN)
                    .status(Status.ACTIVE)
                    .employCode("EMP001")
                    .dob(LocalDate.of(1990, 1, 1))
                    .build();
            adminRepository.save(admin);
        }

        Customer existingCus = customerRepository.findByUsername("customer").orElse(null);
        if (existingCus == null || !existingCus.getCustomerId().equals("cust-uuid-001")) {
            if (existingCus != null) {
                log.info("Deleting outdated customer record to replace with fixed ID: cust-uuid-001");
                customerRepository.delete(existingCus);
                customerRepository.flush();
            }
            Customer customer = Customer.builder()
                    .customerId("cust-uuid-001") // Match frontend hardcoded ID
                    .username("customer")
                    .password(passwordEncoder.encode("customer123"))
                    .customerCode("CUS001")
                    .email("customer@gmail.com")
                    .fullname("Nguyễn Văn Khách")
                    .phone("0912345678")
                    .gender("Nữ")
                    .role(Roles.CUSTOMER)
                    .status(Status.ACTIVE)
                    .build();
            customerRepository.save(customer);
            
            // Create a cart for this customer
            if (cartRepository.findByCustomer_CustomerId("cust-uuid-001").isEmpty()) {
                Cart cart = Cart.builder()
                        .customer(customer)
                        .totalAmount(0.0)
                        .build();
                cartRepository.save(cart);
                log.info("Created default cart for customer: cust-uuid-001");
            }
        }
    }

    private void seedBranches() {
        Branch hn = Branch.builder()
                .branchCode("CH0001")
                .branchName("Phê La - Phạm Ngọc Thạch")
                .latitude(21.0116)
                .longitude(105.8299)
                .city("Hà Nội")
                .district("Đống Đa")
                .address("65 Phạm Ngọc Thạch")
                .status(ProductStatus.SHOW)
                .build();
        branchRepository.save(hn);

        Branch hcm = Branch.builder()
                .branchCode("CH0002")
                .branchName("Phê La - Hồ Tùng Mậu")
                .latitude(10.7714)
                .longitude(106.7042)
                .city("Hồ Chí Minh")
                .district("Quận 1")
                .address("125 Hồ Tùng Mậu")
                .status(ProductStatus.SHOW)
                .build();
        branchRepository.save(hcm);
    }

    private void seedProducts() {
        Category signature = categoryRepository.findByCategoryCode("SIGNATURE").orElse(null);
        Category coffee = categoryRepository.findByCategoryCode("COFFEE").orElse(null);
        Category tea = categoryRepository.findByCategoryCode("TEA").orElse(null);
        Category coldBrew = categoryRepository.findByCategoryCode("COLD_BREW").orElse(null);
        Category syphon = categoryRepository.findByCategoryCode("SYPHON").orElse(null);
        Category frenchPress = categoryRepository.findByCategoryCode("FRENCH_PRESS").orElse(null);
        Category mokaPot = categoryRepository.findByCategoryCode("MOKA_POT").orElse(null);
        Category plus = categoryRepository.findByCategoryCode("PLUS").orElse(null);
        Category topping = categoryRepository.findByCategoryCode("TOPPING").orElse(null);

        String cloudBase = "https://res.cloudinary.com/ducj0zvys/image/upload/v1774429909/";

        if (signature != null) {
            saveProductIfNotExists("SIG001", "Trà Sữa Phê La", "Sự kết hợp hoàn hảo giữa trà Ô Long đặc sản và sữa béo ngậy.", 55000.0, cloudBase + "O-Long-Sua-Phe-La.jpg", signature);
            saveProductIfNotExists("SIG002", "Cà Phê Muối", "Vị mặn dịu của lớp kem muối hòa quyện cùng cà phê đậm đà.", 50000.0, cloudBase + "Ca-Phe-Muoi.jpg", signature);
            saveProductIfNotExists("SIG003", "Ô Long Nhìa", "Trà Ô Long đậm vị, hậu vị ngọt thanh.", 55000.0, cloudBase + "Mat-Nhan.jpg", signature);
        }
        if (coffee != null) {
            saveProductIfNotExists("CF001", "Phê Xỉu Vani", "Arabica Lạc Dương & Robusta Lâm Hà hoà quyện cùng Vani Tự Nhiên.", 55000.0, cloudBase + "Phe-Xiu-Vani_ijnram.jpg", coffee);
            saveProductIfNotExists("CF002", "Phê Espresso (Hạt Colom/Ethi)", "Hạt Arabica cao cấp từ Columbia và Ethiopia.", 45000.0, cloudBase + "Espresso_ColomEthi.jpg", coffee);
            saveProductIfNotExists("CF003", "Phê Latte (Hạt Colom/Ethi)", "Cà phê sữa thơm béo với hạt Arabica tuyển chọn.", 55000.0, cloudBase + "Latte_ColomEthi.jpg", coffee);
            saveProductIfNotExists("CF004", "Phê Nâu", "Cà phê sữa đá truyền thống đậm mượt.", 35000.0, cloudBase + "Phe-Nau.jpg", coffee);
            saveProductIfNotExists("CF005", "Phê Đen", "Cà phê đen nguyên bản đậm đà.", 30000.0, cloudBase + "Phe-Den.jpg", coffee);
            saveProductIfNotExists("CF006", "Cà Phê Bạc Xỉu", "Cà Phê pha theo kiểu Bạc Xỉu Sài Gòn.", 40000.0, cloudBase + "Phe-Xiu-Vani_ijnram.jpg", coffee);
        }
        if (syphon != null) {
            saveProductIfNotExists("SY001", "Phan Xi Păng Long Nhãn", "Trà Ô Long Long Nhãn ngọt ngào hòa quyện cùng cốt dừa đá xay.", 65000.0, cloudBase + "Phan-Xi-Pang-Long-Nhan.jpg", syphon);
            saveProductIfNotExists("SY002", "Mật Nhãn", "Ô Long Long Nhãn Sữa signature.", 60000.0, cloudBase + "Mat-Nhan.jpg", syphon);
            saveProductIfNotExists("SY003", "Ô Long Sữa Phê La", "Vị trà Ô Long đậm đà đặc trưng.", 55000.0, cloudBase + "O-Long-Sua-Phe-La.jpg", syphon);
            saveProductIfNotExists("SY004", "Trà Ô Long Khói Syphon", "Hương khói đặc trưng pha chế tỉ mỉ.", 65000.0, cloudBase + "Khoi-Blao.jpg", syphon);
        }
        if (frenchPress != null) {
            saveProductIfNotExists("FP001", "Gấm - Ô Long Vải Chanh Vàng", "Trà Ô Long Gấm kết hợp với Vải and Chanh Vàng thanh mát.", 60000.0, cloudBase + "Gam.jpg", frenchPress);
            saveProductIfNotExists("FP002", "Lụa Đào", "Ô Long Đào Sữa tươi mát.", 55000.0, cloudBase + "Lua-Dao.jpg", frenchPress);
            saveProductIfNotExists("FP003", "Ô Long Đào Hồng", "Trà Ô Long Đào thơm nhẹ nhàng.", 55000.0, cloudBase + "O-Long-Dao-Hong.jpg", frenchPress);
            saveProductIfNotExists("FP004", "Trà Ô Long Vải French Press", "Vị vải ngọt dịu kết hợp trà Ô Long.", 60000.0, cloudBase + "Gam.jpg", frenchPress);
        }
        if (mokaPot != null) {
            saveProductIfNotExists("MP001", "Tấm", "Sự kết hợp giữa trà Ô Long và gạo rang nguyên chất.", 55000.0, cloudBase + "Tam.jpg", mokaPot);
            saveProductIfNotExists("MP002", "Khói B'Lao", "Trà Ô Long Khói nồng nàn đặc trưng.", 60000.0, cloudBase + "Khoi-Blao.jpg", mokaPot);
            saveProductIfNotExists("MP003", "Trà Gạo Rang Moka Pot", "Hương gạo rang đậm đà từ ấm Moka.", 55000.0, cloudBase + "Tam.jpg", mokaPot);
        }
        if (coldBrew != null) {
            saveProductIfNotExists("CB001", "Sữa Chua Bòng Bưởi", "Sữa Chua Ô Long đá xay và nền trà Cold Brew vị Bưởi.", 65000.0, cloudBase + "Sua-Chua-Bong-Buoi.jpg", coldBrew);
            saveProductIfNotExists("CB002", "Bòng Bưởi", "Ô Long Bưởi Nha Đam thanh mát.", 60000.0, cloudBase + "Bong-Buoi.jpg", coldBrew);
            saveProductIfNotExists("CB003", "Cold Brew Nguyên Bản", "Vị trà ủ lạnh nguyên chất.", 50000.0, cloudBase + "Sua-Chua-Bong-Buoi.jpg", coldBrew);
        }
        if (tea != null) {
            saveProductIfNotExists("TM001", "Matcha Phan Xi Păng", "Kem Ô Long Matcha và cốt dừa đá xay.", 65000.0, cloudBase + "Matcha-Phan-Xi-Pang.jpg", tea);
            saveProductIfNotExists("TM002", "Matcha Coco Latte", "Matcha hòa quyện cùng cốt dừa sữa.", 60000.0, cloudBase + "Matcha-Coco-Latte.jpg", tea);
            saveProductIfNotExists("TM003", "Ô Long Kim Tuyên", "Dòng trà Ô Long cao cấp.", 55000.0, cloudBase + "Matcha-Coco-Latte.jpg", tea);
        }
        if (plus != null) {
            saveProductIfNotExists("PL001", "Plus - Mật Nhãn", "Mật Nhãn đóng lon tiện lợi.", 45000.0, cloudBase + "Plus-Mat-Nhan.jpg", plus);
            saveProductIfNotExists("PL002", "Plus - Lụa Đào", "Lụa Đào đóng lon tiện lợi.", 45000.0, cloudBase + "Plus-Lua-Dao.jpg", plus);
            saveProductIfNotExists("PL003", "Plus - Ô Long Sữa", "Ô Long Sữa đóng lon tiện lợi.", 45000.0, cloudBase + "Plus-Mat-Nhan.jpg", plus);
        }
        if (topping != null) {
            saveProductIfNotExists("TP001", "Trân châu Ô Long", "Trân châu dai đậm vị trà Ô Long.", 10000.0, cloudBase + "Tran-chau-O-Long.jpg", topping);
            saveProductIfNotExists("TP002", "Trân châu trắng", "Trân châu trắng dai giòn.", 10000.0, cloudBase + "Tran-chau-trang.jpg", topping);
            saveProductIfNotExists("TP003", "Kem Phên", "Lớp kem đặc trưng của Phê La.", 15000.0, cloudBase + "Kem-Phen.jpg", topping);
            saveProductIfNotExists("TP004", "Thạch Nhãn", "Thạch trái nhãn giòn ngọt.", 10000.0, cloudBase + "Tran-chau-trang.jpg", topping);
        }
    }

    private void saveProductIfNotExists(String code, String name, String desc, Double price, String img, Category cat) {
        Product product = productRepository.findByProductCode(code).orElse(null);
        if (product == null) {
            product = Product.builder()
                    .productCode(code)
                    .productName(name)
                    .description(desc)
                    .originalPrice(price)
                    .imageUrl(img)
                    .status(ProductStatus.SHOW)
                    .category(cat)
                    .build();
            productRepository.save(product);
        } else {
            // Update existing image URL and price
            product.setImageUrl(img);
            product.setOriginalPrice(price);
            productRepository.saveAndFlush(product);
        }
    }

    private void seedProductSizes() {
        List<Product> products = productRepository.findAll();
        for (Product product : products) {
            if (productSizeRepository.existsByProduct(product)) {
                continue;
            }
            Double basePrice = product.getOriginalPrice();
            
            // Toppings: Regular only
            if (product.getCategory() != null && "TOPPING".equals(product.getCategory().getCategoryCode())) {
                saveSize(product, "Regular", "REG", 0.0, basePrice, product.getProductCode() + "-REG");
                continue;
            }
            
            // Drink sizes (PHÊ, LA)
            saveSize(product, "PHÊ", "PHE", 0.0, basePrice, product.getProductCode() + "-PHE");
            saveSize(product, "LA", "LA", 10000.0, basePrice + 10000.0, product.getProductCode() + "-LA");
            
            // Special PLUS size for PLUS category
            if (product.getCategory() != null && "PLUS".equals(product.getCategory().getCategoryCode())) {
                saveSize(product, "PLUS", "PLUS", 20000.0, basePrice + 20000.0, product.getProductCode() + "-PLUS");
            }
        }
    }

    private void saveSize(Product product, String name, String code, Double addPrice, Double finalPrice, String sku) {
        ProductSize size = ProductSize.builder()
                .product(product)
                .sizeName(name)
                .sizeCode(code)
                .additionalPrice(addPrice)
                .finalPrice(finalPrice)
                .sku(sku)
                .stockQuantity(100)
                .status("ACTIVE")
                .build();
        productSizeRepository.save(size);
    }
}
