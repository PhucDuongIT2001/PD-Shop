# BÁO CÁO DỰ ÁN
## PD-SHOP — HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ TOÀN DIỆN

---

> **Sinh viên thực hiện:** Dương Duy Phúc  
> **Thời gian thực hiện:** 2025 – 2026  
> **Công nghệ chính:** Spring Boot · React.js · MySQL · Docker · AWS EC2  
> **URL triển khai:** http://47.129.213.238.nip.io  

---

## I. TỔNG QUAN DỰ ÁN

PD-Shop là một hệ thống thương mại điện tử (E-Commerce) được xây dựng hoàn chỉnh từ thiết kế cơ sở dữ liệu, phát triển backend, xây dựng giao diện người dùng cho đến triển khai thực tế trên nền tảng điện toán đám mây AWS. Dự án mô phỏng một cửa hàng bán lẻ trực tuyến chuyên về thiết bị công nghệ và thời trang, tích hợp đầy đủ các tính năng hiện đại từ thanh toán trực tuyến, xem sản phẩm 3D (AR) đến hệ thống quản trị nội bộ.

---

## II. MỤC TIÊU DỰ ÁN

- Xây dựng một hệ thống E-Commerce thực tế, đáp ứng đầy đủ quy trình mua hàng từ duyệt sản phẩm → đặt hàng → thanh toán → theo dõi đơn hàng.
- Thiết kế kiến trúc phần mềm chuẩn, dễ mở rộng và bảo trì.
- Áp dụng bảo mật theo chuẩn công nghiệp (JWT, RBAC, BCrypt).
- Triển khai ứng dụng lên môi trường production thực tế trên AWS.
- Tích hợp các tính năng hiện đại: Thanh toán VNPay, xem AR 3D, chatbot AI, đăng nhập Google OAuth2.

---

## III. KIẾN TRÚC HỆ THỐNG

### 3.1. Tổng thể kiến trúc

```
[ Trình duyệt người dùng ]
         │
         ▼
[ Nginx — Reverse Proxy & Static Server ]
    │                  │
    ▼                  ▼
[ React SPA ]   [ Spring Boot API :8080 ]
                        │
                        ▼
                  [ MySQL Database ]
```

Hệ thống được tách biệt rõ ràng thành 3 tầng:

| Tầng | Công nghệ | Vai trò |
|------|-----------|---------|
| **Presentation** | React.js + Tailwind CSS | Giao diện người dùng (SPA) |
| **Business Logic** | Spring Boot (Java 17) | REST API, xử lý nghiệp vụ |
| **Data** | MySQL 8.0 | Lưu trữ dữ liệu bền vững |

Ngoài ra có Nginx đóng vai trò **Reverse Proxy**: điều hướng các request `/api` đến Spring Boot và phục vụ file tĩnh React cho người dùng.

### 3.2. Kiến trúc Backend (Spring Boot)

Backend được tổ chức theo mô hình **Layered Architecture** 3 tầng:

```
Controller  →  Service  →  Repository  →  Database
    ↑               ↑
  DTO/Request    Entity/Domain
```

- **Controller**: Nhận HTTP request, validate input, trả về HTTP response.
- **Service**: Xử lý logic nghiệp vụ, phân quyền (`@PreAuthorize`), ghi audit log.
- **Repository**: Giao tiếp database qua Spring Data JPA / Hibernate.

---

## IV. CÔNG NGHỆ SỬ DỤNG

### 4.1. Backend

| Công nghệ | Phiên bản | Mục đích sử dụng |
|-----------|-----------|-----------------|
| Java | 17 | Ngôn ngữ lập trình chính |
| Spring Boot | 3.3.0 | Framework backend |
| Spring Security | 6.x | Xác thực & phân quyền |
| Spring Data JPA | 3.3.0 | ORM, tương tác database |
| Hibernate | 6.5 | JPA implementation |
| Flyway | 10.x | Database migration |
| MapStruct | 1.5.5 | Entity ↔ DTO mapping |
| JWT (jjwt) | 0.12 | Stateless authentication |
| MySQL Connector | 8.x | Kết nối MySQL |
| Google Gemini API | — | Chatbot AI |

### 4.2. Frontend

| Công nghệ | Phiên bản | Mục đích sử dụng |
|-----------|-----------|-----------------|
| React.js | 18 | UI framework |
| React Router | v6 | Client-side routing |
| Axios | — | HTTP client, interceptors |
| Tailwind CSS | 3.x | Styling, responsive design |
| React Hook Form | — | Quản lý form, validation |
| Yup | — | Schema validation |
| Lucide React | — | Icon library |
| model-viewer | — | Hiển thị mô hình 3D/AR |
| Three.js | — | WebGL 3D rendering |
| Recharts | — | Biểu đồ doanh thu |
| React Hot Toast | — | Thông báo UI |

### 4.3. Hạ tầng & Triển khai

| Công nghệ | Mục đích sử dụng |
|-----------|-----------------|
| Docker | Container hóa ứng dụng |
| Docker Compose | Orchestrate đa container |
| Nginx | Reverse proxy, serve static files |
| AWS EC2 | Cloud server (Ubuntu) |
| AWS S3 | Lưu trữ ảnh sản phẩm |

---

## V. TÍNH NĂNG HỆ THỐNG

### 5.1. Phía Khách Hàng (Customer-facing)

**Quản lý tài khoản:**
- Đăng ký tài khoản với xác thực OTP qua email
- Đăng nhập bằng username/email + mật khẩu
- Đăng nhập nhanh qua **Google OAuth2**
- Quên mật khẩu, đặt lại mật khẩu qua email
- Xem và chỉnh sửa thông tin cá nhân, địa chỉ giao hàng

**Mua sắm:**
- Duyệt sản phẩm theo danh mục, thương hiệu
- Tìm kiếm, lọc (giá, mới nhất, bán chạy)
- Xem chi tiết sản phẩm với gallery ảnh
- **Xem sản phẩm 3D / AR** trực tiếp trên trình duyệt bằng WebXR
- Thêm vào giỏ hàng, quản lý số lượng
- Áp dụng mã giảm giá (coupon)
- Đặt hàng và chọn địa chỉ giao hàng

**Thanh toán:**
- Thanh toán **COD** (tiền mặt khi nhận hàng)
- Thanh toán trực tuyến qua **VNPay** (cổng thanh toán quốc gia)
- Lịch sử giao dịch, trạng thái thanh toán

**Theo dõi đơn hàng:**
- Xem danh sách đơn hàng
- Theo dõi trạng thái (Chờ xác nhận → Đang giao → Đã giao)
- Hủy đơn hàng (nếu chưa xử lý)

**Tương tác:**
- Viết đánh giá & xếp hạng sản phẩm (có hình ảnh)
- **Chat với AI** hỗ trợ tư vấn sản phẩm (Gemini API)
- Nhận thông báo real-time (SSE — Server-Sent Events)

### 5.2. Phía Quản Trị (Admin Dashboard)

**Quản lý sản phẩm:**
- Thêm / Sửa / Xóa sản phẩm
- **Import hàng loạt** từ file Excel (.xlsx)
- Upload ảnh sản phẩm, liên kết mô hình 3D (GLB/USDZ)
- Quản lý tồn kho, cảnh báo sắp hết hàng

**Quản lý kinh doanh:**
- Xem và xử lý đơn hàng (duyệt, đóng gói, giao hàng)
- Quản lý danh mục sản phẩm, thương hiệu
- Quản lý mã giảm giá (tạo, bật/tắt, hạn dùng)
- Quản lý đánh giá khách hàng
- Quản lý tài khoản khách hàng

**Báo cáo & Thống kê:**
- Dashboard tổng quan (doanh thu, đơn hàng, khách hàng mới)
- Biểu đồ doanh thu theo thời gian
- Lịch sử giao dịch thanh toán

**AR Assets:**
- Quản lý các mô hình 3D liên kết với sản phẩm
- Hỗ trợ định dạng GLB (chuẩn Android/Web) và USDZ (chuẩn iOS)
- Hỗ trợ nén DRACO cho file 3D dung lượng lớn

---

## VI. CƠ SỞ DỮ LIỆU

### 6.1. Thiết kế Schema

Hệ thống sử dụng MySQL với thiết kế chuẩn hóa (Normalized), bao gồm các nhóm bảng chính:

**Nhóm xác thực & phân quyền (RBAC):**
```
users ──── user_roles ──── roles ──── role_permissions ──── permissions
```

**Nhóm sản phẩm:**
```
categories ──┐
brands ───────── products ──── product_images
              └── product_variants
              └── product_ar_assets
```

**Nhóm đơn hàng:**
```
users ──── orders ──── order_items ──── products
              └── coupons
```

**Nhóm tương tác:**
```
users ──── reviews ──── products
users ──── cart_items ──── products
users ──── notifications
users ──── chat_sessions ──── chat_messages
```

### 6.2. Quản lý Migration với Flyway

Database được quản lý phiên bản qua Flyway migration scripts, đảm bảo schema nhất quán giữa các môi trường:

```
V1__rbac_and_audit_schema.sql    — Tạo bảng quyền hạn, seed user admin
V2__seed_test_users.sql          — Tạo tài khoản test (staff, customer)
V3__seed_products.sql            — Dữ liệu sản phẩm mẫu
V4__create_reviews_table.sql     — Bảng đánh giá sản phẩm
V5__create_chat_tables.sql       — Bảng chat AI
V6__alter_chat_messages_text.sql — Mở rộng kiểu dữ liệu
```

---

## VII. BẢO MẬT HỆ THỐNG

### 7.1. Xác thực — JWT (JSON Web Token)

Hệ thống sử dụng xác thực stateless với JWT:

1. Người dùng đăng nhập → Server xác thực → Trả về **JWT Token**
2. Mọi request tiếp theo đính kèm token trong header: `Authorization: Bearer <token>`
3. Server verify token mà không cần query database → **Hiệu năng cao**
4. Token có thời hạn 24 giờ, tự động hết hạn

### 7.2. Phân quyền — RBAC (Role-Based Access Control)

```
ADMIN  → Toàn quyền (quản lý hệ thống)
STAFF  → Xem và xử lý đơn hàng
USER   → Mua hàng, đánh giá, quản lý đơn hàng của mình
```

Kiểm soát quyền 2 lớp:
- **Controller layer**: `@PreAuthorize` kiểm tra role
- **Service layer**: Phân quyền theo permission cụ thể (PRODUCT_CREATE, ORDER_VIEW,...)

### 7.3. Bảo mật mật khẩu — BCrypt

Mật khẩu được hash bằng thuật toán BCrypt với cost factor 10 trước khi lưu vào database. Không có khả năng reverse hash → An toàn ngay cả khi database bị lộ.

### 7.4. Các biện pháp bảo mật khác

| Biện pháp | Mô tả |
|-----------|-------|
| **CORS Configuration** | Chỉ cho phép domain đã cấu hình gọi API |
| **Rate Limiting** | Giới hạn số lần đăng nhập sai tránh brute force |
| **Input Validation** | Validate dữ liệu đầu vào phía server |
| **Soft Delete** | Xóa logic với cột `is_deleted`, không mất dữ liệu |
| **Audit Log** | Ghi lại mọi thao tác quản trị (ai làm gì, lúc nào) |
| **Environment Variables** | Không hardcode secret, dùng biến môi trường |

---

## VIII. QUY TRÌNH TRIỂN KHAI (DEPLOYMENT)

### 8.1. Môi trường triển khai

```
AWS EC2 (Ubuntu 22.04)
├── Docker
│   ├── pdshop_nginx    (Nginx:alpine — port 80)
│   ├── pdshop_app      (Spring Boot — port 8080)
│   └── pdshop_mysql    (MySQL 8.0 — port 3306)
└── Volumes
    ├── db_data         (MySQL persistent data)
    └── app_uploads     (File uploads)
```

### 8.2. Quy trình CI/CD thủ công

```
1. Phát triển trên máy local
      ↓
2. mvn clean package (build JAR local)
      ↓
3. npm run build (build React dist)
      ↓
4. scp JAR + dist lên EC2
      ↓
5. docker build image từ JAR có sẵn
      ↓
6. docker restart containers
      ↓
7. Kiểm tra API + giao diện
```

### 8.3. Lý do build local thay vì build trên server

Trong quá trình triển khai, server EC2 gặp tình trạng **hết dung lượng ổ đĩa** (99.4% đã sử dụng). Giải pháp được áp dụng:

- Build JAR bằng Maven trên máy local (nhanh, tiết kiệm tài nguyên server)
- Upload file JAR (~127MB) lên server qua SCP
- Build Docker image từ JAR có sẵn thay vì build từ source code
- Kết quả: **Tiết kiệm ~1.5GB** dung lượng trên server, thời gian build giảm từ 5 phút xuống 30 giây

---

## IX. KHÓ KHĂN & CÁCH GIẢI QUYẾT

### 9.1. Lỗi Jackson — Hibernate Proxy Serialization

**Vấn đề**: API `/admin/products` trả về response rỗng hoặc lỗi 500 khi Spring Boot cố serialize entity chứa Hibernate Lazy proxy object.

```
HttpMessageNotWritableException: Could not write JSON
```

**Nguyên nhân**: Các entity `Brand`, `Category` dùng `FetchType.LAZY` → Jackson không thể serialize Hibernate proxy khi session đã đóng.

**Giải pháp**: Thêm annotation vào các entity:
```java
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Brand { ... }
```

---

### 9.2. Lỗi BCrypt Hash qua SSH Shell

**Vấn đề**: Khi update mật khẩu admin qua SSH command, ký tự `$` trong BCrypt hash bị shell interpret sai → hash bị hỏng → đăng nhập thất bại.

**Giải pháp**: Viết câu SQL vào file tạm, sau đó pipe vào MySQL:
```bash
python3 -c "import bcrypt; h=bcrypt.hashpw(...); 
  open('/tmp/fix.sql','w').write(f'UPDATE users SET password=\"{h}\"...')"
docker exec -i mysql mysql < /tmp/fix.sql
```

---

### 9.3. Lỗi Docker Network — Hostname không resolve

**Vấn đề**: Sau khi restart nginx, trang web không truy cập được với lỗi:
```
host not found in upstream "app"
```

**Nguyên nhân**: Container Spring Boot được tạo thủ công với tên `pdshop_app`, nhưng `nginx.conf` proxy đến hostname `app` (tên service trong docker-compose). Trong Docker network, hostname là **tên container**, không phải tên image.

**Giải pháp**: Sửa `nginx.conf`:
```nginx
# Trước (sai)
proxy_pass http://app:8080;

# Sau (đúng)
proxy_pass http://pdshop_app:8080;
```

**Bài học**: Khi không dùng docker-compose, cần đảm bảo `--name` container khớp với hostname được tham chiếu trong config.

---

### 9.4. Import Excel bị lỗi trùng SKU

**Vấn đề**: Khi import file Excel lần 2, báo lỗi do SKU đã tồn tại trong database.

**Giải pháp**: Sửa logic import sử dụng `INSERT IGNORE` hoặc `ON DUPLICATE KEY UPDATE` để bỏ qua/cập nhật bản ghi trùng thay vì báo lỗi.

---

### 9.5. Admin Header không điều hướng về trang chủ

**Vấn đề**: Nút ADMIN ở góc phải header chỉ là `<div>` thông thường, không có link điều hướng.

**Giải pháp**: Nâng cấp thành **dropdown menu** với React state management, `useRef` để detect click bên ngoài, và `<Link to="/">` để điều hướng về trang chủ.

---

## X. KẾT QUẢ ĐẠT ĐƯỢC

### 10.1. Hệ thống hoạt động

| Tính năng | Trạng thái |
|-----------|-----------|
| Đăng ký / Đăng nhập | ✅ Hoàn thành |
| Đăng nhập Google OAuth2 | ✅ Hoàn thành |
| Xem & tìm kiếm sản phẩm | ✅ Hoàn thành |
| Giỏ hàng | ✅ Hoàn thành |
| Thanh toán VNPay | ✅ Hoàn thành |
| Thanh toán COD | ✅ Hoàn thành |
| Theo dõi đơn hàng | ✅ Hoàn thành |
| Đánh giá sản phẩm | ✅ Hoàn thành |
| Xem sản phẩm 3D / AR | ✅ Hoàn thành |
| Chat AI (Gemini) | ✅ Hoàn thành |
| Thông báo real-time | ✅ Hoàn thành |
| Admin Dashboard | ✅ Hoàn thành |
| Import Excel hàng loạt | ✅ Hoàn thành |
| Báo cáo doanh thu | ✅ Hoàn thành |
| Triển khai AWS | ✅ Hoàn thành |

### 10.2. Số liệu kỹ thuật

| Chỉ số | Giá trị |
|--------|---------|
| Tổng số file Java (backend) | ~165 files |
| Tổng số React components | ~80+ components |
| Số bảng database | ~20 bảng |
| Số REST API endpoint | ~60+ endpoints |
| Kích thước frontend bundle | ~2.2 MB (gzipped: 624 KB) |
| Thời gian khởi động Spring Boot | ~23 giây |

---

## XI. KINH NGHIỆM & BÀI HỌC RÚT RA

### 11.1. Về Kỹ Thuật

1. **Kiến trúc phần mềm**: Hiểu rõ tầm quan trọng của việc tách biệt các tầng (Layered Architecture). Code dễ đọc, dễ test, dễ mở rộng.

2. **ORM và Database**: Hiểu cách Hibernate quản lý entity lifecycle, sự khác biệt giữa `LAZY` và `EAGER` loading, khi nào nên dùng cái nào.

3. **Bảo mật ứng dụng**: Không chỉ là "thêm JWT là xong", mà phải hiểu toàn bộ security chain: Authentication → Authorization → Resource Protection.

4. **Docker & Containerization**: Container không chỉ là "đóng gói app". Phải hiểu về Docker network, volume, restart policy, và cách các container giao tiếp với nhau.

5. **Debug production**: Kỹ năng đọc log, kiểm tra DB trực tiếp, test API bằng curl là rất quan trọng khi không có debugger.

### 11.2. Về Quy Trình

1. **Luôn test API bằng curl/Postman** trước khi kết luận lỗi ở frontend.
2. **Kiểm tra database trực tiếp** để xác nhận dữ liệu đã được lưu đúng.
3. **Đọc log đầy đủ** — lỗi thực sự thường nằm ở dòng cuối log, không phải dòng đầu.
4. **Sao lưu trước khi thay đổi** production database.
5. **Environment variables** cho tất cả thông tin nhạy cảm (password, API key, secret).

### 11.3. Về Tư Duy

> *"Môi trường production không bao giờ giống môi trường development."*

Đây là bài học quan trọng nhất. Dù ứng dụng chạy hoàn hảo trên local, vẫn có thể gặp vô số vấn đề khi triển khai thực tế: hết dung lượng disk, network policy, permission file system, DNS resolve, SSL certificate...

Kỹ năng quan trọng không chỉ là biết code, mà là **biết cách tìm ra vấn đề và giải quyết nó một cách có hệ thống**.

---

## XII. HƯỚNG PHÁT TRIỂN TIẾP THEO

| Tính năng | Mô tả |
|-----------|-------|
| **CI/CD Pipeline** | Tự động hóa build & deploy qua GitHub Actions |
| **Redis Cache** | Cache sản phẩm hot, session management |
| **Elasticsearch** | Tìm kiếm sản phẩm nâng cao (fulltext, fuzzy search) |
| **Microservices** | Tách Order Service, Payment Service độc lập |
| **Mobile App** | React Native app cho iOS/Android |
| **SSL/HTTPS** | Let's Encrypt certificate |
| **CDN** | CloudFront phân phối ảnh/static assets |
| **Load Balancing** | Nhiều instance backend, Nginx upstream |

---

## XIII. KẾT LUẬN

Dự án PD-Shop không chỉ là bài thực hành kỹ thuật mà là hành trình trải nghiệm **toàn bộ vòng đời phát triển phần mềm**: từ phân tích yêu cầu, thiết kế hệ thống, lập trình, kiểm thử cho đến triển khai và vận hành trên môi trường thực tế.

Qua dự án này, tôi đã nắm vững không chỉ các công nghệ cụ thể (Spring Boot, React, Docker, AWS) mà còn phát triển tư duy giải quyết vấn đề trong môi trường thực tế — nơi mọi thứ không bao giờ diễn ra theo lý thuyết. Đây chính là nền tảng quan trọng nhất cho sự nghiệp kỹ sư phần mềm.

---

*© 2026 — Dương Duy Phúc — PD-Shop Project Report*
