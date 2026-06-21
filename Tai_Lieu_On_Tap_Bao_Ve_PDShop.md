# TÀI LIỆU ÔN TẬP BẢO VỆ DỰ ÁN PD-SHOP (20 CÂU HỎI CHI TIẾT)
## HƯỚNG DẪN TRẢ LỜI CÁC CÂU HỎI CỦA HỘI ĐỒNG BẢO VỆ (TẬP TRUNG VÀO CODE & THỰC TẾ)

Tài liệu này tổng hợp 20 câu hỏi trọng tâm nhất mà hội đồng giáo viên có thể hỏi, chia làm các nhóm từ kiến trúc tổng quan, thiết kế cơ sở dữ liệu, bảo mật, code chi tiết backend/frontend, cho đến quy trình triển khai thực tế.

---

## MỤC LỤC
*   [PHẦN 1: KIẾN TRÚC & PHÂN LỚP HỆ THỐNG (3 câu)](#phần-1-kiến-trúc--phân-lớp-hệ-thống-3-câu)
*   [PHẦN 2: CƠ SỞ DỮ LIỆU & SPRING DATA JPA (4 câu)](#phần-2-cơ-sở-dữ-liệu--spring-data-jpa-4-câu)
*   [PHẦN 3: BẢO MẬT & PHÂN QUYỀN - SPRING SECURITY (4 câu)](#phần-3-bảo-mật--phân-quyền---spring-security-4-câu)
*   [PHẦN 4: THIẾT KẾ CODE & TÍNH NĂNG NÂNG CAO BACKEND (5 câu)](#phần-4-thiết-kế-code--tính-năng-nâng-cao-backend-5-câu)
*   [PHẦN 5: GIAO DIỆN & TƯƠNG TÁC FRONTEND (React) (2 câu)](#phần-5-giao-diện--tương-tác-frontend-react-2-câu)
*   [PHẦN 6: DEVOPS & KHẮC PHỤC LỖI THỰC TẾ (2 câu)](#phần-6-devops--khắc-phục-lỗi-thực-tế-2-câu)

---

## PHẦN 1: KIẾN TRÚC & PHÂN LỚP HỆ THỐNG (3 câu)

### Câu 1: Em hãy giải thích mô hình Layered Architecture (Kiến trúc phân tầng) trong Spring Boot backend của em? Tại sao lại chia nhỏ như vậy?
*   **Mục đích câu hỏi:** Kiểm tra tính khoa học trong cách tổ chức code.
*   **Giải thích trong code:** Trong project, code được chia thành các package: `controller`, `service`, `repository`, `entity`, và `dto`.
*   **Gợi ý trả lời:**
    *   Hệ thống của em chia làm 3 lớp chính độc lập:
        1.  **Presentation Layer (Controller):** Tiếp nhận HTTP Request từ frontend, thực hiện validation dữ liệu thô đầu vào và trả về HTTP Response (định dạng DTO).
        2.  **Business Logic Layer (Service):** Nơi xử lý toàn bộ nghiệp vụ của hệ thống (tính tiền, áp mã giảm giá, kiểm tra tồn kho, gửi mail). Các Service sẽ không gọi trực tiếp Database mà phải thông qua lớp Repository.
        3.  **Data Access Layer (Repository):** Giao tiếp trực tiếp với MySQL Database thông qua Spring Data JPA.
    *   **Lý do chia nhỏ:** Tăng khả năng bảo trì (maintainability), dễ kiểm thử (unit test), dễ mở rộng và tái sử dụng code. Nếu thay đổi công nghệ database, lớp nghiệp vụ (Service) hầu như không phải sửa đổi.

### Câu 2: Em hãy trình bày chi tiết luồng xử lý của một HTTP request từ React gửi đến Spring Boot cho tới khi trả về kết quả?
*   **Mục đích câu hỏi:** Kiểm tra kiến thức tổng quan về luồng dữ liệu (Data flow).
*   **Gợi ý trả lời:**
    1.  Frontend React dùng thư viện **Axios** gửi một HTTP request lên server.
    2.  Request đi qua **Nginx** (được cấu hình ở cổng 80/443). Nginx điều hướng các request có tiền tố `/api` đến cổng `8080` của Spring Boot container.
    3.  Tại Spring Boot, request đi qua chuỗi các filter bảo mật của **Spring Security** (bao gồm `RateLimitFilter` kiểm tra chống spam và `AuthTokenFilter` kiểm tra token JWT).
    4.  Nếu token hợp lệ, request đi vào **Controller** tương ứng (ví dụ: `ProductController`).
    5.  Controller tiếp nhận, chuyển đổi Request Body thành Object Java và gọi sang **Service** tương ứng (`ProductService`).
    6.  Service thực hiện kiểm tra nghiệp vụ và gọi **Repository** để thực hiện truy vấn.
    7.  Repository gửi câu lệnh SQL vào **MySQL Database** -> DB trả dữ liệu dạng Entity -> Service chuyển đổi Entity thành DTO thông qua **MapStruct** -> Controller trả về DTO định dạng JSON -> Nginx -> Client nhận được dữ liệu và React render ra màn hình.

### Câu 3: Làm thế nào để em quản lý và xử lý các lỗi tập trung (Global Exception Handling) trong backend?
*   **Mục đích câu hỏi:** Đánh giá khả năng viết code sạch và kiểm soát lỗi hệ thống.
*   **Giải thích trong code:** Lớp `GlobalExceptionHandler.java` sử dụng annotation `@RestControllerAdvice`.
*   **Gợi ý trả lời:**
    *   Em sử dụng mô hình xử lý lỗi tập trung bằng cách tạo class `GlobalExceptionHandler` chú thích với `@RestControllerAdvice`.
    *   Bên trong, em sử dụng annotation `@ExceptionHandler` cho từng loại Exception cụ thể (ví dụ: `ResourceNotFoundException`, `InsufficientStockException`, hay `AccessDeniedException`).
    *   Khi có bất kỳ lỗi nào xảy ra ở tầng Service hay Repository, em chỉ cần ném ra (`throw`) exception tương ứng. Spring Boot sẽ tự động bắt lấy exception đó tại `GlobalExceptionHandler`, bao gói dữ liệu lỗi theo cấu trúc DTO chuẩn của hệ thống (`ApiResponse.error(...)`) và trả về mã HTTP Status chính xác (400, 403, 404, 500) cho Frontend.

---

## PHẦN 2: CƠ SỞ DỮ LIỆU & SPRING DATA JPA (4 câu)

### Câu 4: Cơ chế Migration bằng Flyway hoạt động thế nào trong dự án? Em đã tổ chức các file script ra sao?
*   **Mục đích câu hỏi:** Kiểm tra tính thực chiến trong quản lý database schema.
*   **Giải thích trong code:** Thư mục `src/main/resources/db/migration` chứa các file SQL được đánh số phiên bản `V1`, `V2`, `V3`...
*   **Gợi ý trả lời:**
    *   Khi ứng dụng khởi động, **Flyway** sẽ tự động quét thư mục `db/migration`.
    *   Nó sẽ đối chiếu danh sách các file SQL migration với bảng `flyway_schema_history` trong Database. Nếu file nào chưa được thực thi, Flyway sẽ tự động chạy file đó theo thứ tự phiên bản tăng dần.
    *   Trong dự án, em chia các script làm các bước: `V1` tạo schema RBAC và bảng gốc, `V2` seed tài khoản test, `V3` seed dữ liệu sản phẩm, `V4` tạo bảng review, `V5` tạo bảng chat AI...
    *   **Lợi ích:** Đảm bảo database của dự án đồng bộ 100% giữa môi trường local của em và môi trường thực tế trên AWS EC2.

### Câu 5: Lỗi Jackson - Hibernate Proxy Serialization mà em gặp phải trong báo cáo là gì? Em sửa bằng cách nào trong mã nguồn?
*   **Mục đích câu hỏi:** Kiểm tra kiến thức chuyên sâu về Hibernate Entity Lifecycle và Jackson Serialization.
*   **Giải thích trong code:** Lỗi xảy ra khi serialize các trường quan hệ có cấu hình `FetchType.LAZY`. Khắc phục bằng cách dùng `@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})` trên các Entity (ví dụ: `Brand`, `Category`).
*   **Gợi ý trả lời:**
    *   **Nguyên nhân:** Do em cấu hình quan hệ giữa các thực thể là `FetchType.LAZY` (Nạp dữ liệu trì hoãn). Khi đó Hibernate sẽ tạo ra một đối tượng Proxy giả lập cho trường liên kết. Khi API chuyển đổi Entity thành JSON, thư viện Jackson ObjectMapper cố gắng quét và chuyển đổi tất cả các thuộc tính của đối tượng, bao gồm cả các trường kỹ thuật nội bộ của Hibernate proxy (`hibernateLazyInitializer` và `handler`). Do phiên làm việc (Session) JPA lúc này đã đóng, việc đọc các trường này gây lỗi `HttpMessageNotWritableException` (lỗi 500).
    *   **Giải pháp:** Em thêm annotation `@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})` ở mức Class của Entity để báo Jackson bỏ qua không serialize các trường kỹ thuật của Hibernate proxy khi chuyển đổi JSON.

### Câu 6: Tại sao em lại sử dụng Optimistic Locking (Khóa lạc quan) với annotation `@Version` trong entity `Inventory` và `Product`? Cơ chế hoạt động của nó thế nào?
*   **Mục đích câu hỏi:** Đánh giá giải pháp xử lý tranh chấp dữ liệu (Concurrency Control) khi có nhiều người mua hàng cùng lúc.
*   **Giải thích trong code:** Lớp `Inventory.java` và `Product.java` có một trường được đánh dấu bằng `@Version`.
*   **Gợi ý trả lời:**
    *   Trong hệ thống bán hàng, khi nhiều khách hàng cùng đặt mua một sản phẩm cùng lúc, nếu không kiểm soát sẽ xảy ra tình trạng trừ nhầm số lượng tồn kho (lỗi Lost Update).
    *   Em sử dụng **Optimistic Locking** bằng cách thêm cột `version` kiểu số nguyên trong bảng `Inventory` và `Product`, đánh dấu bằng annotation `@Version` của JPA.
    *   **Cơ chế hoạt động:** Khi một transaction đọc dữ liệu ra, nó sẽ lấy cả giá trị `version`. Khi cập nhật dữ liệu, Hibernate sẽ chạy câu lệnh SQL có điều kiện: `UPDATE inventory SET stock = new_stock, version = version + 1 WHERE id = ? AND version = current_version`. 
    *   Nếu có một người khác đã cập nhật trước đó làm số `version` trong DB tăng lên, điều kiện `WHERE version = current_version` không còn đúng -> số bản ghi được cập nhật bằng 0 -> Hibernate lập tức ném ra lỗi `ObjectOptimisticLockingFailureException`. Lỗi này được em bắt tại `GlobalExceptionHandler` để thông báo cho khách hàng tải lại trang và thử lại, đảm bảo dữ liệu tồn kho luôn chính xác.

### Câu 7: MapStruct là gì? Tại sao em sử dụng nó thay vì ModelMapper hay viết code set/get thủ công?
*   **Mục đích câu hỏi:** Kiểm tra kiến thức về tối ưu hóa code và hiệu năng mapper.
*   **Giải thích trong code:** Các interface mapper nằm trong package `com.example.demo.mapper`.
*   **Gợi ý trả lời:**
    *   **MapStruct** là một thư viện hỗ trợ tự động sinh code chuyển đổi qua lại giữa Entity (đối tượng lưu database) và DTO (đối tượng trả về cho Client).
    *   **So với set/get thủ công:** Tiết kiệm thời gian viết code lặp đi lặp lại, tránh lỗi gán nhầm trường dữ liệu.
    *   **So với ModelMapper:** ModelMapper sử dụng cơ chế *Reflection* tại thời điểm runtime để map dữ liệu, gây ảnh hưởng đáng kể đến hiệu năng hệ thống. Trong khi đó, MapStruct sinh mã nguồn map trực tiếp (gán set/get tường minh) bằng Java thuần ngay tại thời điểm compile (build ứng dụng). Do đó, hiệu năng của MapStruct tương đương với việc viết code set/get thủ công và nhanh hơn rất nhiều so với ModelMapper.

---

## PHẦN 3: BẢO MẬT & PHÂN QUYỀN - SPRING SECURITY (4 câu)

### Câu 8: Em hãy trình bày cấu trúc của Security Filter Chain trong file `SecurityConfig.java`? `AuthTokenFilter` đóng vai trò gì?
*   **Mục đích câu hỏi:** Kiểm tra hiểu biết cốt lõi về luồng Filter trong Spring Security.
*   **Giải thích trong code:** Lớp `SecurityConfig.java` chứa `@Bean SecurityFilterChain filterChain`. Lớp `AuthTokenFilter` kế thừa `OncePerRequestFilter`.
*   **Gợi ý trả lời:**
    *   Trong `SecurityConfig.java`, em cấu hình một **FilterChain** để quản lý các chính sách bảo mật: Tắt CSRF (vì hệ thống là stateless JWT), cấu hình CORS cho phép các domain Frontend chỉ định, cấu hình session stateless, và thiết lập quyền truy cập cho từng endpoint (endpoint công khai và endpoint admin `/api/admin/**`).
    *   **AuthTokenFilter** là một filter tùy biến của em, được chèn vào trước `UsernamePasswordAuthenticationFilter`.
    *   **Luồng hoạt động:** Với mỗi request gửi lên, filter này sẽ:
        1. Trích xuất token từ Header `Authorization: Bearer <token>`.
        2. Verify tính hợp lệ và thời hạn của token bằng Secret Key.
        3. Nếu token hợp lệ, nó lấy thông tin username/roles từ token, truy vấn hoặc tạo đối tượng `UserDetails`, bao bọc thành một `UsernamePasswordAuthenticationToken` và set vào **SecurityContextHolder**. Từ thời điểm này, request được coi là đã đăng nhập thành công.

### Câu 9: Cơ chế Rate Limiting chống spam trong dự án được em viết ở đâu và hoạt động như thế nào?
*   **Mục đích câu hỏi:** Kiểm tra kỹ năng bảo mật nâng cao chống tấn công brute-force.
*   **Giải thích trong code:** Lớp `RateLimitFilter.java` sử dụng thư viện **Bucket4j**.
*   **Gợi ý trả lời:**
    *   Em tạo một filter tùy chỉnh tên là `RateLimitFilter` sử dụng thuật toán **Token Bucket** qua thư viện **Bucket4j**.
    *   Filter này chỉ áp dụng giới hạn cho các request dạng `POST` gửi tới các API nhạy cảm như `/login`, `/register`, `/api/auth` (đăng ký/đăng nhập) để chống tấn công Brute-force mật khẩu hoặc spam đăng ký tài khoản rác.
    *   **Cấu hình:** Mỗi IP client (`request.getRemoteAddr()`) sẽ tương ứng với một chiếc "xô" (Bucket) chứa tối đa **5 token mỗi phút**. Mỗi request thành công tiêu tốn 1 token. Nếu người dùng gửi quá 5 request trong 1 phút, filter sẽ chặn lại ngay lập tức và trả về mã lỗi **HTTP 429 Too Many Requests** cùng thông điệp tiếng Việt thân thiện mà không cần xử lý sâu vào database, giúp bảo vệ RAM và CPU của server.

### Câu 10: Quy trình tích hợp đăng nhập Google OAuth2 trong dự án diễn ra như thế nào? Làm sao em đồng bộ tài khoản Google với Database?
*   **Mục đích câu hỏi:** Kiểm tra luồng xác thực bên thứ ba (Third-party Authentication).
*   **Giải thích trong code:** Sử dụng cấu hình `.oauth2Login` trong `SecurityConfig.java` kết hợp `CustomOAuth2UserService` và `CustomAuthenticationSuccessHandler`.
*   **Gợi ý trả lời:**
    1.  Người dùng bấm nút "Đăng nhập với Google" trên React.
    2.  Hệ thống chuyển hướng người dùng sang trang xác thực của Google.
    3.  Sau khi người dùng đồng ý cấp quyền, Google trả về một Authorization Code cho Spring Boot Backend.
    4.  Backend gửi code này lại cho Google để lấy Access Token, từ đó lấy thông tin chi tiết của User (email, name, avatar) thông qua lớp `CustomOAuth2UserService`.
    5.  **Đồng bộ Database:** Trong `CustomOAuth2UserService`, em kiểm tra email Google xem đã tồn tại trong bảng `users` chưa:
        *   Nếu chưa: Hệ thống tự động tạo một tài khoản mới với email đó, gán mật khẩu ngẫu nhiên được mã hóa và cấp role mặc định là `ROLE_USER`.
        *   Nếu rồi: Hệ thống tiến hành cập nhật thông tin mới nhất (tên, ảnh đại diện).
    6.  Cuối cùng, `CustomAuthenticationSuccessHandler` sẽ sinh ra một chuỗi JWT Token của hệ thống ta và redirect người dùng về trang Frontend kèm theo token để lưu giữ trạng thái đăng nhập.

### Câu 11: Em phân quyền bằng cách nào trên các REST API endpoint? Sự khác biệt giữa `@PreAuthorize` và phân quyền trực tiếp trong Filter Chain?
*   **Mục đích câu hỏi:** Đánh giá tính phân quyền chặt chẽ (Method-level security vs URL-level security).
*   **Giải thích trong code:** Chú thích `@EnableMethodSecurity(prePostEnabled = true)` ở `SecurityConfig.java` và `@PreAuthorize("hasRole('...')")` ở các Controller.
*   **Gợi ý trả lời:**
    *   **URL-level security:** Cấu hình trong `SecurityFilterChain` thông qua `.requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "STAFF")`. Đây là lớp phòng vệ đầu tiên giúp lọc các đường dẫn lớn theo vai trò tổng quát.
    *   **Method-level security (Khuyên dùng):** Em sử dụng `@PreAuthorize` trực tiếp trên các phương thức của Controller hoặc Service để kiểm tra chi tiết hơn.
        *   *Ví dụ:* `@PreAuthorize("hasAuthority('PRODUCT_CREATE')")` giúp chỉ những tài khoản có quyền tạo sản phẩm mới được gọi hàm.
    *   **Điểm mạnh:** Sử dụng `@PreAuthorize` giúp cấu hình phân quyền linh hoạt hơn, có thể viết các câu lệnh kiểm tra logic động như đối chiếu ID người dùng hiện tại có trùng với chủ sở hữu của tài nguyên được sửa hay không.

---

## PHẦN 4: THIẾT KẾ CODE & TÍNH NĂNG NÂNG CAO BACKEND (5 câu)

### Câu 12: Em hãy giải thích quy trình tích hợp thanh toán VNPay? Cách em verify (xác thực) kết quả thanh toán từ VNPay để đảm bảo an toàn?
*   **Mục đích câu hỏi:** Đánh giá khả năng xử lý tích hợp API thanh toán tài chính thực tế.
*   **Giải thích trong code:** Lớp `PaymentController.java` và `VNPAYConfig.java`.
*   **Gợi ý trả lời:**
    *   **Quy trình:** Khi người dùng thanh toán, Backend tính toán số tiền và gọi VNPay tạo một URL thanh toán có kèm mã băm chữ ký điện tử `vnp_SecureHash` được tạo từ các tham số giao dịch + **Hash Secret Key** (chuỗi bí mật VNPay cấp riêng).
    *   Sau khi khách thanh toán thành công, VNPay gọi về hai cổng của ta:
        1.  **Return URL (Frontend):** Hiển thị màn hình thông báo kết quả cho khách hàng trực quan.
        2.  **IPN URL (Backend):** Đây là API ngầm cực kỳ quan trọng để cập nhật trạng thái đơn hàng vào database.
    *   **Cơ chế xác thực an toàn tại IPN:**
        *   Backend nhận các tham số do VNPay trả về, tiến hành sắp xếp các tham số theo bảng chữ cái và thực hiện băm lại bằng thuật toán **HMAC-SHA512** sử dụng Hash Secret Key của cửa hàng.
        *   Đối chiếu chuỗi hash tự tính toán này với tham số `vnp_SecureHash` do VNPay gửi qua. Nếu trùng khớp -> xác định dữ liệu không bị sửa đổi trên đường truyền.
        *   Tiếp tục kiểm tra mã đơn hàng (`vnp_TxnRef`) có tồn tại trong database không, số tiền thanh toán (`vnp_Amount`) có khớp với giá trị đơn hàng thực tế không, và đơn hàng đó đã được cập nhật trạng thái trước đó chưa. Nếu tất cả đều khớp, mới tiến hành cập nhật trạng thái đơn hàng thành "Đã thanh toán".

### Câu 13: Ghi log lịch sử hoạt động của Admin (Audit Log) hoạt động như thế nào? Tại sao em lại cấu hình `@Async` và `@Transactional(propagation = Propagation.REQUIRES_NEW)` cho phương thức ghi log?
*   **Mục đích câu hỏi:** Đánh giá tư duy thiết kế hệ thống bất đồng bộ và quản lý giao dịch (Transaction management) cao cấp.
*   **Giải thích trong code:** Lớp `AuditLogService.java` chứa annotation `@Async` và `@Transactional(propagation = Propagation.REQUIRES_NEW)`.
*   **Gợi ý trả lời:**
    *   **Audit Log** ghi lại nhật ký xem Admin nào đã làm gì, sửa đổi thông tin sản phẩm/đơn hàng từ giá trị cũ nào sang giá trị mới nào. Em sử dụng **AOP (Aspect-Oriented Programming)** để chặn các phương thức thao tác dữ liệu và tự động ghi log.
    *   **Tại sao dùng `@Async`:** Ghi log là tác vụ phụ, không nên làm chậm luồng xử lý chính của người dùng. `@Async` giúp đẩy tác vụ ghi log sang một Thread Pool riêng biệt để xử lý dưới dạng "Fire-and-forget", giúp API phản hồi cho admin ngay lập tức.
    *   **Tại sao dùng `Propagation.REQUIRES_NEW`:** Khi một admin cập nhật sản phẩm nhưng thao tác đó bị lỗi và transaction chính bị rollback (hoàn tác). Nếu dùng transaction chung, dòng log báo lỗi cũng sẽ bị rollback mất. Sử dụng `REQUIRES_NEW` giúp tạo ra một transaction hoàn toàn độc lập với transaction nghiệp vụ chính. Nhờ đó, dù giao dịch cập nhật sản phẩm thất bại, thông tin ghi nhận Admin đó đã cố gắng thực hiện hành vi cập nhật vẫn được lưu lại an toàn trong cơ sở dữ liệu.

### Câu 14: Tại sao em lại chọn Server-Sent Events (SSE) để làm tính năng thông báo Real-time thay vì sử dụng WebSocket?
*   **Mục đích câu hỏi:** Đánh giá khả năng so sánh công nghệ và lựa chọn giải pháp tối ưu chi phí tài nguyên.
*   **Gợi ý trả lời:**
    *   **WebSocket** là giao thức truyền thông hai chiều (Bidirectional) toàn phần. Cần thiết khi làm các ứng dụng chat, game multiplayer nơi client và server liên tục gửi tin nhắn qua lại.
    *   **Server-Sent Events (SSE)** là giao thức truyền dữ liệu một chiều (Unidirectional) từ Server về Client dựa trên nền tảng HTTP tiêu chuẩn.
    *   **Lý do chọn SSE cho Thông báo (Notifications):**
        *   Tính năng thông báo chỉ cần luồng truyền dữ liệu từ Server đẩy về Client (Server-to-Client) khi có đơn hàng mới hoặc cập nhật trạng thái, Client không cần gửi ngược tin nhắn lên qua luồng này.
        *   SSE chạy trên giao thức HTTP tiêu chuẩn, không cần bắt tay nâng cấp giao thức phức tạp như WebSocket, tự động hỗ trợ kết nối lại (Auto-reconnect) khi mất mạng, cấu hình tường lửa/proxy (Nginx) dễ dàng hơn nhiều và tốn ít tài nguyên kết nối hơn trên server.

### Câu 15: Em hãy trình bày luồng import sản phẩm hàng loạt từ file Excel? Làm thế nào để em tối ưu hóa tốc độ ghi dữ liệu và xử lý khi bị trùng SKU?
*   **Mục đích câu hỏi:** Đánh giá kỹ năng xử lý dữ liệu lớn (Batch Processing) và tối ưu hóa truy vấn Database.
*   **Gợi ý trả lời:**
    *   **Luồng xử lý:** Admin upload file `.xlsx` -> Backend sử dụng thư viện **Apache POI** để đọc file Excel theo từng dòng -> Convert dữ liệu dòng thành List các DTO sản phẩm -> Thực hiện lưu vào Database.
    *   **Tối ưu tốc độ:** Thay vì thực hiện lệnh `save()` cho từng sản phẩm (gây hàng trăm kết nối mạng đến database), em sử dụng tính năng **Batch Save** (`repository.saveAll(productList)`). Em cấu hình trong `application.properties` thuộc tính `spring.jpa.properties.hibernate.jdbc.batch_size=50` để Hibernate gộp nhiều câu lệnh Insert thành một gói gửi đi một lần, giúp tốc độ import tăng gấp nhiều lần.
    *   **Xử lý trùng SKU:** Trong database, cột `sku` được đánh chỉ mục Unique (Duy nhất). Khi import, em kiểm tra trùng SKU bằng cách: 
        *   Tải danh sách các SKU hiện có trong DB lên Map để tra cứu nhanh.
        *   Nếu SKU trong Excel đã có dưới DB, em áp dụng logic cập nhật đè số lượng tồn kho và giá tiền (tương đương `ON DUPLICATE KEY UPDATE`), thay vì ném lỗi làm dừng toàn bộ quá trình import của các sản phẩm phía sau.

### Câu 16: Tính năng gửi email xác thực OTP được em tối ưu hóa như thế nào để người dùng không phải chờ lâu lúc nhấn nút Đăng ký?
*   **Mục đích câu hỏi:** Kiểm tra kỹ năng tối ưu hóa luồng xử lý đồng thời (Concurrency) bằng Multithreading.
*   **Giải thích trong code:** Thư mục `EmailService.java` có phương thức gửi mail được đánh dấu `@Async`.
*   **Gợi ý trả lời:**
    *   Quá trình kết nối đến máy chủ Mail SMTP (ví dụ Gmail SMTP) và gửi đi một bức thư điện tử mất trung bình từ 2 đến 5 giây. Nếu chạy đồng bộ (synchronous), người dùng sau khi nhấn "Đăng ký" sẽ phải đợi màn hình quay vòng xoay 5 giây rồi mới được chuyển trang.
    *   **Tối ưu:** Em bật tính năng xử lý bất đồng bộ của Spring Boot bằng annotation `@EnableAsync` ở lớp khởi chạy và chú thích `@Async` trên phương thức gửi email của `EmailService`.
    *   Khi người dùng nhấn đăng ký, Spring Boot tạo user tạm dưới DB và lập tức trả về phản hồi "Thành công - Hãy kiểm tra email" cho client (chỉ mất ~100ms). Đồng thời, tác vụ kết nối và gửi OTP bằng Email sẽ được chạy ngầm bởi một Thread độc lập trong Thread Pool.

---

## PHẦN 5: GIAO DIỆN & TƯƠNG TÁC FRONTEND (React) (2 câu)

### Câu 17: Em hãy giải thích cơ chế định tuyến (Routing) và bảo vệ các Router (Route Guarding) phía Frontend React?
*   **Mục đích câu hỏi:** Đánh giá khả năng bảo mật phía Client-side.
*   **Giải thích trong code:** Sử dụng `React Router v6` với các component tự định nghĩa như `PrivateRoute` hay `AdminRoute`.
*   **Gợi ý trả lời:**
    *   Em sử dụng thư viện **React Router v6** để định nghĩa cây thư mục route của ứng dụng.
    *   Để phân quyền truy cập ở Frontend, em tạo các component bao gói (Wrapper Components) như `PrivateRoute` (chỉ cho phép user đã đăng nhập) và `AdminRoute` (chỉ cho phép các tài khoản có role `ADMIN` hoặc `STAFF`).
    *   **Cơ chế hoạt động:** Khi người dùng chuyển trang, component `AdminRoute` sẽ kiểm tra thông tin user lưu trữ trong global state (React Context hoặc Redux) hoặc giải mã nhanh JWT trong LocalStorage.
        *   Nếu hợp lệ: Trả về component con (`<Outlet />` hoặc trang Admin thực tế).
        *   Nếu chưa đăng nhập hoặc sai quyền: Sử dụng component `<Navigate to="/login" />` để cưỡng chế chuyển hướng người dùng về trang đăng nhập hoặc trang báo lỗi 403 Forbidden.

### Câu 18: Tính năng hiển thị 3D và AR trên trình duyệt làm thế nào để hiển thị được trên cả điện thoại (Android/iOS) và máy tính?
*   **Mục đích câu hỏi:** Đánh giá tính tương thích đa nền tảng (Cross-platform compatibility) của giao diện.
*   **Gợi ý trả lời:**
    *   Em sử dụng web component `<model-viewer>` của Google giúp hiển thị tương thích tốt trên mọi trình duyệt hiện đại (Chrome, Safari, Firefox).
    *   **Trên PC/Laptop:** Người dùng có thể dùng chuột để xoay, thu phóng mô hình 3D trực quan nhờ thư viện WebGL/Three.js chạy ngầm bên dưới.
    *   **Trên Điện thoại:**
        *   **Thiết bị Android:** model-viewer sẽ kích hoạt tính năng **Scene Viewer** của Google ARCore thông qua file định dạng `.glb`.
        *   **Thiết bị iOS (iPhone/iPad):** Sử dụng tính năng **Quick Look** của Apple ARKit thông qua file định dạng `.usdz`. Khi người dùng nhấn vào biểu tượng AR, camera của điện thoại sẽ mở ra để quét mặt phẳng mặt đất và đặt mô hình sản phẩm vào không gian thực tế với tỉ lệ kích thước thật (1:1).

---

## PHẦN 6: DEVOPS & KHẮC PHỤC LỖI THỰC TẾ (2 câu)

### Câu 19: Tại sao em lại cấu hình Nginx làm Reverse Proxy đứng trước Spring Boot mà không cho Client kết nối trực tiếp đến cổng 8080 của Java?
*   **Mục đích câu hỏi:** Kiểm tra kiến thức về kiến trúc hạ tầng và bảo mật mạng (Network security).
*   **Gợi ý trả lời:**
    *   **Bảo mật:** Giúp ẩn đi cổng chạy thực tế của Spring Boot (`8080`). Người dùng chỉ giao tiếp qua cổng Web tiêu chuẩn `80` (HTTP) hoặc `443` (HTTPS) của Nginx.
    *   **Khắc phục lỗi CORS:** Do cả Frontend (React SPA) và Backend API đều chạy dưới chung một tên miền/IP và cổng do Nginx phân phối (Nginx điều hướng request `/api` vào backend, các request khác trả về file tĩnh React). Do đó trình duyệt coi đây là cùng một nguồn (Same-Origin), loại bỏ hoàn toàn các rắc rối liên quan đến CORS.
    *   **Hiệu năng:** Nginx xử lý việc phân phối các file giao diện tĩnh (HTML, CSS, JS, ảnh) cực kỳ nhanh, giúp Spring Boot giảm tải tài nguyên RAM/CPU để tập trung xử lý các logic nghiệp vụ nặng.

### Câu 20: Em hãy trình bày sự cố Docker Network khiến hệ thống không truy cập được sau khi restart và cách em debug giải quyết nó?
*   **Mục đích câu hỏi:** Đánh giá tư duy giải quyết sự cố (Troubleshooting) thực tế.
*   **Gợi ý trả lời:**
    *   **Hiện tượng:** Sau khi em tiến hành restart container Nginx và Spring Boot, trang web không thể kết nối đến backend và log của Nginx báo lỗi: `host not found in upstream "app"`.
    *   **Debug:** Em kiểm tra file cấu hình `nginx.conf` thấy dòng cấu hình `proxy_pass http://app:8080;`. Khi chạy trên môi trường local với Docker Compose, docker-compose tự tạo mạng nội bộ và ánh xạ service name `app` làm hostname. Tuy nhiên, trên server AWS EC2, do dung lượng ổ đĩa bị cạn kiệt, em đã chuyển sang chạy các container Docker độc lập bằng lệnh `docker run` thủ công và đặt tên container backend là `pdshop_app`.
    *   **Nguyên nhân:** Khi chạy độc lập, Docker bridge network phân giải hostname của các container dựa theo **tên container** được chỉ định qua tham số `--name`, Nginx không thể tìm thấy host nào tên là `app` dẫn đến lỗi khởi động.
    *   **Giải pháp:** Em đã chỉnh sửa file cấu hình `nginx.conf`, đổi địa chỉ chuyển tiếp từ `http://app:8080` thành `http://pdshop_app:8080` để trỏ đúng tên container backend đang chạy thực tế, sau đó khởi động lại Nginx và hệ thống hoạt động bình thường.

---
*Chúc bạn Dương Duy Phúc ôn tập kỹ lưỡng và bảo vệ đồ án đạt kết quả cao nhất!*
