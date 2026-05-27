-- ============================================================
-- V3__seed_products.sql
-- Seed dữ liệu mẫu: 6 Danh mục, 8 Thương hiệu, 30 Sản phẩm
-- Ảnh thumbnail dùng URL từ Unsplash (không cần upload file)
-- ============================================================

-- ── 1. CATEGORIES ────────────────────────────────────────────
INSERT IGNORE INTO categories (name, slug, description, active) VALUES
('Điện thoại',    'dien-thoai',    'Smartphone các hãng nổi tiếng', 1),
('Laptop',        'laptop',        'Máy tính xách tay văn phòng & gaming', 1),
('Máy tính bảng', 'may-tinh-bang', 'Tablet Android & iPad', 1),
('Tai nghe',      'tai-nghe',      'Tai nghe không dây, có dây, gaming', 1),
('Đồng hồ thông minh', 'dong-ho-thong-minh', 'Smartwatch & fitness tracker', 1),
('Phụ kiện',      'phu-kien',      'Ốp lưng, cáp sạc, bàn phím, chuột', 1);

-- ── 2. BRANDS ────────────────────────────────────────────────
INSERT IGNORE INTO brands (name, slug, description, active) VALUES
('Apple',   'apple',   'Thương hiệu công nghệ hàng đầu của Mỹ', 1),
('Samsung', 'samsung', 'Tập đoàn điện tử đa quốc gia của Hàn Quốc', 1),
('Sony',    'sony',    'Tập đoàn điện tử và giải trí của Nhật Bản', 1),
('Xiaomi',  'xiaomi',  'Thương hiệu công nghệ hàng đầu của Trung Quốc', 1),
('ASUS',    'asus',    'Hãng máy tính và linh kiện của Đài Loan', 1),
('Dell',    'dell',    'Hãng máy tính cá nhân hàng đầu thế giới', 1),
('Logitech','logitech','Hãng phụ kiện máy tính hàng đầu Thụy Sĩ', 1),
('JBL',     'jbl',     'Thương hiệu âm thanh chuyên nghiệp', 1);

-- ── 3. PRODUCTS ──────────────────────────────────────────────
-- Cột: name, slug, sku, price, base_price, description, short_description,
--      quantity, sold_quantity, low_stock_threshold, thumbnail,
--      warranty_period, is_new, status, is_deleted, version,
--      category_id (subquery), brand_id (subquery)

-- === ĐIỆN THOẠI (8 sản phẩm) ===

INSERT IGNORE INTO products
  (name, slug, sku, price, base_price, description, short_description,
   quantity, sold_quantity, low_stock_threshold, thumbnail,
   warranty_period, is_new, status, is_deleted, version, category_id, brand_id)
VALUES
(
  'iPhone 16 Pro Max',
  'iphone-16-pro-max',
  'IP16PM-256',
  34990000, 36990000,
  'iPhone 16 Pro Max với chip A18 Pro, camera 48MP với tính năng Camera Control mới, màn hình Super Retina XDR 6.9 inch, pin 4685mAh. Hỗ trợ Apple Intelligence, Action Button và sạc MagSafe.',
  'Chip A18 Pro | Camera 48MP | Màn hình 6.9" OLED | Apple Intelligence',
  50, 120, 5,
  'https://images.unsplash.com/photo-1591337676887-a217a8bf3b27?w=400&q=80',
  12, 'true', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='dien-thoai'),
  (SELECT id FROM brands WHERE slug='apple')
),
(
  'iPhone 15',
  'iphone-15',
  'IP15-128',
  22990000, 24990000,
  'iPhone 15 với chip A16 Bionic, Dynamic Island, camera chính 48MP, cổng USB-C thay Lightning. Màn hình Super Retina XDR 6.1 inch, kính cường lực Ceramic Shield.',
  'Chip A16 Bionic | Camera 48MP | USB-C | Dynamic Island',
  80, 200, 10,
  'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80',
  12, 'false', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='dien-thoai'),
  (SELECT id FROM brands WHERE slug='apple')
),
(
  'Samsung Galaxy S24 Ultra',
  'samsung-galaxy-s24-ultra',
  'SGS24U-256',
  31990000, 33990000,
  'Samsung Galaxy S24 Ultra với bút S Pen tích hợp, chip Snapdragon 8 Gen 3, camera zoom quang 10x, màn hình Dynamic AMOLED 2X 6.8 inch 120Hz. Hỗ trợ Galaxy AI.',
  'Snapdragon 8 Gen 3 | S Pen | Camera 200MP | Galaxy AI',
  45, 90, 5,
  'https://images.unsplash.com/photo-1707757303524-c34911f97a96?w=400&q=80',
  12, 'true', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='dien-thoai'),
  (SELECT id FROM brands WHERE slug='samsung')
),
(
  'Samsung Galaxy A55 5G',
  'samsung-galaxy-a55-5g',
  'SGA55-128',
  9490000, 10490000,
  'Samsung Galaxy A55 5G với chip Exynos 1480, màn hình Super AMOLED 6.6 inch 120Hz, camera chính 50MP OIS, pin 5000mAh sạc nhanh 25W, IP67 chống nước.',
  'Exynos 1480 | Camera 50MP OIS | 5G | IP67',
  100, 350, 10,
  'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80',
  12, 'false', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='dien-thoai'),
  (SELECT id FROM brands WHERE slug='samsung')
),
(
  'Xiaomi 14 Ultra',
  'xiaomi-14-ultra',
  'XM14U-512',
  28990000, 30490000,
  'Xiaomi 14 Ultra hợp tác cùng Leica, camera Light Fusion 900 với ống kính 1 inch, chip Snapdragon 8 Gen 3, sạc không dây 80W. Màn hình AMOLED 6.73 inch 120Hz.',
  'Camera Leica 1-inch | Snapdragon 8 Gen 3 | Sạc 90W',
  30, 55, 5,
  'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80',
  12, 'true', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='dien-thoai'),
  (SELECT id FROM brands WHERE slug='xiaomi')
),
(
  'Xiaomi Redmi Note 13 Pro+',
  'xiaomi-redmi-note-13-pro-plus',
  'XMRN13PP-256',
  8990000, 9490000,
  'Redmi Note 13 Pro+ với camera 200MP OIS, chip Dimensity 7200 Ultra, sạc siêu nhanh HyperCharge 120W, màn hình AMOLED 6.67 inch 120Hz, IP68 chống nước.',
  'Camera 200MP | Sạc 120W | Dimensity 7200 | IP68',
  120, 420, 15,
  'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&q=80',
  12, 'false', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='dien-thoai'),
  (SELECT id FROM brands WHERE slug='xiaomi')
),
(
  'Samsung Galaxy Z Fold 6',
  'samsung-galaxy-z-fold-6',
  'SGZF6-256',
  44990000, 47990000,
  'Samsung Galaxy Z Fold 6 - điện thoại gập cao cấp với màn hình trong 7.6 inch và màn hình ngoài 6.3 inch, chip Snapdragon 8 Gen 3, S Pen tương thích, pin 4400mAh.',
  'Màn hình gập 7.6" | Snapdragon 8 Gen 3 | S Pen | Galaxy AI',
  15, 20, 3,
  'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&q=80',
  12, 'true', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='dien-thoai'),
  (SELECT id FROM brands WHERE slug='samsung')
),
(
  'iPhone SE 3 (2022)',
  'iphone-se-3-2022',
  'IPSE3-64',
  10990000, 12490000,
  'iPhone SE thế hệ 3 với chip A15 Bionic mạnh mẽ, camera chính 12MP, hỗ trợ 5G, Touch ID, thiết kế compact 4.7 inch quen thuộc. Lựa chọn tốt nhất trong tầm giá.',
  'Chip A15 Bionic | 5G | Touch ID | Camera 12MP',
  60, 180, 10,
  'https://images.unsplash.com/photo-1592286927505-1def25115558?w=400&q=80',
  12, 'false', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='dien-thoai'),
  (SELECT id FROM brands WHERE slug='apple')
),

-- === LAPTOP (8 sản phẩm) ===

(
  'MacBook Pro 14 M3 Pro',
  'macbook-pro-14-m3-pro',
  'MBP14-M3P',
  54990000, 57990000,
  'MacBook Pro 14 inch với chip M3 Pro, màn hình Liquid Retina XDR 3024x1964px, pin lên đến 18 giờ, kết nối HDMI, SD card, MagSafe 3. RAM 18GB, SSD 512GB.',
  'Chip M3 Pro | Màn hình Liquid Retina XDR | RAM 18GB | Pin 18h',
  25, 60, 5,
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
  12, 'true', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='laptop'),
  (SELECT id FROM brands WHERE slug='apple')
),
(
  'MacBook Air M2',
  'macbook-air-m2',
  'MBA-M2-256',
  28990000, 30490000,
  'MacBook Air M2 thiết kế hoàn toàn mới, màn hình Liquid Retina 13.6 inch, chip M2 8 nhân CPU, camera 1080p FaceTime, MagSafe sạc từ tính. Không quạt, siêu mỏng nhẹ.',
  'Chip M2 | Màn hình 13.6" Liquid Retina | Không quạt | Camera 1080p',
  40, 150, 5,
  'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&q=80',
  12, 'false', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='laptop'),
  (SELECT id FROM brands WHERE slug='apple')
),
(
  'ASUS ROG Zephyrus G16',
  'asus-rog-zephyrus-g16',
  'ROGZG16-RTX4070',
  42990000, 45990000,
  'ASUS ROG Zephyrus G16 laptop gaming cao cấp với Intel Core Ultra 9 185H, RTX 4070 8GB, màn hình OLED 2.5K 240Hz 16 inch, RAM 32GB DDR5, SSD 1TB PCIe 4.0.',
  'Core Ultra 9 | RTX 4070 | OLED 240Hz | RAM 32GB DDR5',
  20, 35, 3,
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80',
  12, 'true', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='laptop'),
  (SELECT id FROM brands WHERE slug='asus')
),
(
  'ASUS VivoBook 15',
  'asus-vivobook-15',
  'ASVB15-I5',
  14990000, 16490000,
  'ASUS VivoBook 15 với Intel Core i5-1235U, RAM 16GB DDR4, SSD 512GB, màn hình Full HD 15.6 inch IPS, bàn phím số, cổng HDMI & USB-C. Phù hợp học tập và văn phòng.',
  'Intel Core i5 Gen 12 | RAM 16GB | SSD 512GB | Màn 15.6" FHD',
  55, 220, 10,
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80',
  12, 'false', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='laptop'),
  (SELECT id FROM brands WHERE slug='asus')
),
(
  'Dell XPS 15',
  'dell-xps-15',
  'DXPS15-I7',
  38990000, 41990000,
  'Dell XPS 15 với Intel Core i7-13700H, RTX 4060 8GB, màn hình OLED 3.5K cảm ứng, RAM 32GB DDR5, SSD 1TB. Thiết kế nhôm cao cấp, màn hình tràn viền InfinityEdge.',
  'Core i7-13700H | RTX 4060 | OLED 3.5K | RAM 32GB',
  18, 40, 3,
  'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=400&q=80',
  12, 'true', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='laptop'),
  (SELECT id FROM brands WHERE slug='dell')
),
(
  'Dell Inspiron 15 3000',
  'dell-inspiron-15-3000',
  'DI153000-I3',
  10990000, 12490000,
  'Dell Inspiron 15 3000 phù hợp cho sinh viên, Intel Core i3-1215U, RAM 8GB DDR4, SSD 256GB, màn hình 15.6 inch HD, Windows 11 Home bản quyền, pin 3 cell 41Whr.',
  'Intel Core i3 | RAM 8GB | SSD 256GB | Windows 11 bản quyền',
  70, 300, 10,
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
  12, 'false', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='laptop'),
  (SELECT id FROM brands WHERE slug='dell')
),
(
  'ASUS ZenBook 14 OLED',
  'asus-zenbook-14-oled',
  'ASZB14-OLED',
  22990000, 24490000,
  'ASUS ZenBook 14 OLED với AMD Ryzen 7 7730U, màn hình OLED 2.8K 90Hz 14 inch, RAM 16GB LPDDR5, SSD 512GB, thiết kế siêu mỏng 14.9mm, cảm biến vân tay, Windows 11.',
  'Ryzen 7 | OLED 2.8K 90Hz | RAM 16GB | Siêu mỏng 14.9mm',
  35, 85, 5,
  'https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=400&q=80',
  12, 'true', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='laptop'),
  (SELECT id FROM brands WHERE slug='asus')
),
(
  'Samsung Galaxy Book4 Pro',
  'samsung-galaxy-book4-pro',
  'SGBK4P-I7',
  35990000, 38990000,
  'Samsung Galaxy Book4 Pro với Intel Core Ultra 7 155H, màn hình Dynamic AMOLED 2X 14 inch 120Hz, RAM 16GB LPDDR5X, SSD 512GB, Galaxy AI, trọng lượng chỉ 1.17kg.',
  'Core Ultra 7 | Dynamic AMOLED 14" 120Hz | Galaxy AI | 1.17kg',
  22, 30, 3,
  'https://images.unsplash.com/photo-1484788984921-03950022c38b?w=400&q=80',
  12, 'true', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='laptop'),
  (SELECT id FROM brands WHERE slug='samsung')
),

-- === MÁY TÍNH BẢNG (4 sản phẩm) ===

(
  'iPad Pro M4 11 inch',
  'ipad-pro-m4-11-inch',
  'IPADPROM4-11',
  23990000, 25990000,
  'iPad Pro M4 mỏng nhất từ trước đến nay chỉ 5.1mm, chip M4 13 nhân, màn hình Ultra Retina XDR OLED tandem 11 inch, Apple Pencil Pro tương thích, WiFi 6E.',
  'Chip M4 | OLED Ultra Retina XDR | Mỏng 5.1mm | WiFi 6E',
  30, 50, 5,
  'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80',
  12, 'true', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='may-tinh-bang'),
  (SELECT id FROM brands WHERE slug='apple')
),
(
  'Samsung Galaxy Tab S9 FE',
  'samsung-galaxy-tab-s9-fe',
  'SGTABS9FE-128',
  9990000, 11490000,
  'Samsung Galaxy Tab S9 FE với màn hình 10.9 inch TFT 90Hz, chip Exynos 1380, S Pen tặng kèm, IP68 chống nước, pin 8000mAh sạc 45W, DeX mode hỗ trợ.',
  'Màn 10.9" 90Hz | S Pen kèm theo | IP68 | Pin 8000mAh',
  50, 120, 8,
  'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=400&q=80',
  12, 'false', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='may-tinh-bang'),
  (SELECT id FROM brands WHERE slug='samsung')
),
(
  'Xiaomi Pad 6',
  'xiaomi-pad-6',
  'XMPAD6-128',
  6490000, 7290000,
  'Xiaomi Pad 6 với màn hình 11 inch 144Hz 2.8K IPS, chip Snapdragon 870, RAM 8GB, bộ nhớ 128GB, pin 8840mAh. Hỗ trợ bút cảm ứng và bàn phím rời.',
  'Màn 11" 2.8K 144Hz | Snapdragon 870 | RAM 8GB | Pin 8840mAh',
  60, 200, 10,
  'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&q=80',
  12, 'false', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='may-tinh-bang'),
  (SELECT id FROM brands WHERE slug='xiaomi')
),
(
  'iPad Air M2 13 inch',
  'ipad-air-m2-13-inch',
  'IPADAIRM2-13',
  20990000, 22490000,
  'iPad Air M2 13 inch mới nhất với chip M2 mạnh mẽ, màn hình Liquid Retina 13 inch, Apple Pencil Pro & Magic Keyboard tương thích, Wi-Fi 6E & 5G, pin cả ngày.',
  'Chip M2 | Màn Liquid Retina 13" | Apple Pencil Pro | Wi-Fi 6E',
  25, 40, 5,
  'https://images.unsplash.com/photo-1623126908029-58cb08a2b272?w=400&q=80',
  12, 'true', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='may-tinh-bang'),
  (SELECT id FROM brands WHERE slug='apple')
),

-- === TAI NGHE (5 sản phẩm) ===

(
  'Sony WH-1000XM5',
  'sony-wh-1000xm5',
  'SNYWH1000XM5',
  8490000, 9490000,
  'Sony WH-1000XM5 tai nghe chống ồn tốt nhất thị trường với 8 microphone, chip HD Noise Cancelling QN1e, thời lượng pin 30 giờ, sạc nhanh 3 phút dùng 3 giờ.',
  'Chống ồn hàng đầu | 8 Microphone | Pin 30h | Sạc nhanh',
  40, 180, 5,
  'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80',
  12, 'false', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='tai-nghe'),
  (SELECT id FROM brands WHERE slug='sony')
),
(
  'AirPods Pro 2',
  'airpods-pro-2',
  'AIRDPRO2',
  6990000, 7490000,
  'AirPods Pro thế hệ 2 với chip H2, chống ồn chủ động ANC thế hệ mới, Transparency Mode, Adaptive Audio, loa và micro được nâng cấp. Case sạc USB-C và MagSafe.',
  'Chip H2 | ANC thế hệ 2 | Adaptive Audio | Sạc USB-C',
  60, 250, 10,
  'https://images.unsplash.com/photo-1659502184849-e8fead4aac60?w=400&q=80',
  12, 'false', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='tai-nghe'),
  (SELECT id FROM brands WHERE slug='apple')
),
(
  'JBL Tune 770NC',
  'jbl-tune-770nc',
  'JBLT770NC',
  2490000, 2990000,
  'JBL Tune 770NC tai nghe chụp tai không dây có ANC, âm thanh JBL Pure Bass, pin 70 giờ (ANC tắt) hay 44 giờ (ANC bật), kết nối đa điểm, micro tích hợp.',
  'JBL Pure Bass | ANC | Pin 70h | Kết nối đa điểm',
  80, 350, 10,
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
  12, 'false', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='tai-nghe'),
  (SELECT id FROM brands WHERE slug='jbl')
),
(
  'Samsung Galaxy Buds3 Pro',
  'samsung-galaxy-buds3-pro',
  'SGGB3P',
  4990000, 5990000,
  'Samsung Galaxy Buds3 Pro thiết kế blade hoàn toàn mới, 360 Audio, ANC thế hệ tiếp theo, Hi-Fi 24-bit, chống ước IPX7. Kết nối với Galaxy AI trên điện thoại Samsung.',
  '360 Audio | ANC | Hi-Fi 24-bit | IPX7 | Galaxy AI',
  45, 95, 5,
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80',
  12, 'true', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='tai-nghe'),
  (SELECT id FROM brands WHERE slug='samsung')
),
(
  'Sony WF-1000XM5',
  'sony-wf-1000xm5',
  'SNYWF1000XM5',
  6290000, 7490000,
  'Sony WF-1000XM5 tai nghe true wireless nhỏ nhất của Sony, chip V2 và QN2e, chống ồn ưu việt, LDAC chất lượng cao, pin 8h (24h với case), IPX4.',
  'Chip V2 + QN2e | LDAC | IPX4 | Pin 8h + 24h case',
  35, 110, 5,
  'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80',
  12, 'true', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='tai-nghe'),
  (SELECT id FROM brands WHERE slug='sony')
),

-- === ĐỒNG HỒ THÔNG MINH (3 sản phẩm) ===

(
  'Apple Watch Series 10',
  'apple-watch-series-10',
  'AW-S10-GPS',
  11990000, 12990000,
  'Apple Watch Series 10 mỏng nhất từ trước đến nay, màn hình lớn hơn Retina Always-On, tính năng phát hiện ngủ ngáy, ECG, đo SpO2, GPS. Vỏ nhôm 46mm.',
  'Màn hình lớn hơn | Phát hiện ngủ ngáy | ECG | GPS',
  50, 150, 10,
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
  12, 'true', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='dong-ho-thong-minh'),
  (SELECT id FROM brands WHERE slug='apple')
),
(
  'Samsung Galaxy Watch7',
  'samsung-galaxy-watch7',
  'SGGW7-44MM',
  7990000, 8990000,
  'Samsung Galaxy Watch7 với chip Exynos W1000 mới, theo dõi sức khỏe AI tiên tiến, đo đường huyết, phát hiện ngã, GPT, BioActive Sensor thế hệ 3, pin 40h.',
  'Exynos W1000 | Theo dõi sức khỏe AI | Đo đường huyết | Pin 40h',
  40, 85, 5,
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80',
  12, 'true', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='dong-ho-thong-minh'),
  (SELECT id FROM brands WHERE slug='samsung')
),
(
  'Xiaomi Watch S3',
  'xiaomi-watch-s3',
  'XMWS3',
  2990000, 3490000,
  'Xiaomi Watch S3 với bezel có thể thay thế, màn hình AMOLED 1.43 inch, 150+ chế độ thể thao, GPS, SpO2, nhịp tim 24/7, pin 15 ngày. Hệ điều hành HyperOS.',
  'Bezel thay thế | AMOLED 1.43" | 150+ Thể thao | Pin 15 ngày',
  70, 200, 10,
  'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&q=80',
  12, 'false', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='dong-ho-thong-minh'),
  (SELECT id FROM brands WHERE slug='xiaomi')
),

-- === PHỤ KIỆN (2 sản phẩm) ===

(
  'Logitech MX Master 3S',
  'logitech-mx-master-3s',
  'LGMXM3S',
  2190000, 2490000,
  'Logitech MX Master 3S chuột không dây cao cấp với 8K DPI, cuộn MagSpeed siêu êm, pin 70 ngày, kết nối 3 thiết bị, tương thích đa nền tảng Windows/Mac/Linux.',
  '8K DPI | MagSpeed | Pin 70 ngày | Kết nối 3 thiết bị',
  90, 420, 15,
  'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80',
  12, 'false', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='phu-kien'),
  (SELECT id FROM brands WHERE slug='logitech')
),
(
  'Apple MagSafe Charger 15W',
  'apple-magsafe-charger-15w',
  'APMSAFE15W',
  990000, 1190000,
  'Củ sạc MagSafe chính hãng Apple 15W dành cho iPhone 12 trở lên, kết nối từ tính tự động căn chỉnh, sạc nhanh không dây 15W, tương thích Qi2, cáp dài 1m.',
  'Sạc từ tính 15W | Tự căn chỉnh | Tương thích Qi2 | Cáp 1m',
  150, 800, 20,
  'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=400&q=80',
  12, 'false', 'ACTIVE', 0, 0,
  (SELECT id FROM categories WHERE slug='phu-kien'),
  (SELECT id FROM brands WHERE slug='apple')
);
