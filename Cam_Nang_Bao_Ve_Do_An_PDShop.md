# CẨM NANG BẢO VỆ ĐỒ ÁN TỐT NGHIỆP: HỆ THỐNG PD-SHOP
## TÀI LIỆU DÀNH CHO SINH VIÊN DƯƠNG DUY PHÚC (2025 - 2026)

Tài liệu này được xây dựng bởi chuyên gia thiết kế slide học thuật và thành viên hội đồng chấm đồ án CNTT, dựa trên báo cáo thực tế dự án **PD-Shop**.

---

## PHẦN A: CHI TIẾT 18 SLIDE THUYẾT TRÌNH & LỜI THOẠI

### Slide 1: Trang bìa (Trang mở đầu)
*   **Nội dung hiển thị:**
    *   **Đề tài:** Hệ thống Thương mại Điện tử PD-Shop
    *   **Tiểu đề đề tài:** Tích hợp công nghệ WebAR, Chatbot AI và Cổng thanh toán trực tuyến
    *   **Sinh viên thực hiện:** Dương Duy Phúc
    *   **Giảng viên hướng dẫn:** (Điền tên GVHD của bạn)
    *   **Công nghệ cốt lõi:** Spring Boot • React.js • MySQL • Docker • AWS
*   **Hình ảnh gợi ý đưa vào:** Logo trường Đại học của bạn (đặt trang trọng góc trên).
*   **Lời thuyết trình (Presenter Script):**
    > "Kính thưa quý thầy cô trong Hội đồng chấm đồ án tốt nghiệp. Em tên là Dương Duy Phúc. Hôm nay, em xin phép được trình bày báo cáo đề tài đồ án tốt nghiệp của mình mang tên: 'Hệ thống Thương mại Điện tử PD-Shop — Tích hợp công nghệ WebAR, Chatbot AI và Cổng thanh toán trực tuyến'. Đồ án của em hướng tới việc giải quyết bài toán mua sắm trực quan thời kỳ số và tối ưu hóa vận hành hệ thống trên cloud. Sau đây, em xin phép bắt đầu phần trình bày."

---

### Slide 2: Đặt vấn đề
*   **Nội dung hiển thị:**
    *   **Bài toán thực tế:** Sự cạnh tranh khốc liệt của thị trường E-Commerce đòi hỏi liên tục nâng cấp trải nghiệm người dùng.
    *   **Hạn chế của Web truyền thống:**
        *   Hình ảnh 2D tĩnh không mô tả chân thực sản phẩm (kích thước, kiểu dáng trong không gian thực).
        *   Tỷ lệ hoàn trả hàng cao do khách hàng hiểu sai về sản phẩm thực tế.
        *   Bộ phận tư vấn chăm sóc khách hàng bị quá tải, không thể hỗ trợ 24/7.
        *   Phương thức thanh toán COD tiềm ẩn nhiều rủi ro bom hàng cho doanh nghiệp.
*   **Hình ảnh gợi ý đưa vào:** Chụp ảnh minh họa một trang web bán hàng thông thường với hình ảnh 2D đơn điệu đối lập với biểu tượng AR/3D.
*   **Lời thuyết trình (Presenter Script):**
    > "Thưa thầy cô, sự bùng nổ của thương mại điện tử mang lại cơ hội lớn nhưng cũng đi kèm nhiều thách thức. Hạn chế lớn nhất của các website truyền thống hiện nay là chỉ cung cấp hình ảnh 2D tĩnh, khiến khách hàng khó hình dung sản phẩm thực tế dẫn tới tỷ lệ hủy hoặc hoàn đơn rất cao. Thêm vào đó, việc chăm sóc khách hàng 24/7 bằng nhân sự và quản lý rủi ro từ đơn hàng COD luôn là bài toán đau đầu của các chủ doanh nghiệp. Đây chính là lý do em đề xuất giải pháp PD-Shop."

---

### Slide 3: Mục tiêu đề tài
*   **Nội dung hiển thị:**
    *   **Mục tiêu tổng quát:** Xây dựng hệ thống thương mại điện tử hoàn chỉnh, bảo mật cao, hoạt động thực tế trên đám mây đám AWS.
    *   **Mục tiêu cụ thể:**
        *   Tích hợp công nghệ **WebAR** xem mô hình 3D trực tiếp trên trình duyệt.
        *   Tích hợp **Chatbot AI** tư vấn tự động dựa trên danh sách sản phẩm.
        *   Tích hợp cổng thanh toán quốc gia **VNPay** đảm bảo giao dịch an toàn.
        *   Đóng gói hệ thống bằng **Docker Compose** và tối ưu quy trình deploy.
*   **Hình ảnh gợi ý đưa vào:** Biểu tượng mục tiêu (Target icon) ở giữa với 4 nhánh trỏ ra 4 công nghệ đột phá.
*   **Lời thuyết trình (Presenter Script):**
    > "Để giải quyết các thách thức trên, đề tài hướng tới mục tiêu tổng quát là xây dựng hệ thống PD-Shop thương mại điện tử toàn diện. Cụ thể, hệ thống sẽ được tích hợp công nghệ WebAR cho phép quét sản phẩm 3D trực quan, chatbot AI tự động hóa chăm sóc khách hàng 24/7, cổng VNPay nâng cao tỷ lệ thanh toán không tiền mặt, và toàn bộ hệ thống được container hóa bằng Docker, sẵn sàng tự động hóa deploy lên cloud AWS."

---

### Slide 4: Giải pháp đề xuất
*   **Nội dung hiển thị (Tối giản chữ - Ưu tiên Card Layout):**
    *   **WebAR:** Hiển thị mô hình 3D tỉ lệ 1:1 trong phòng bằng camera điện thoại.
    *   **AI Chatbot:** Tự động hóa tư vấn thông tin sản phẩm và chính sách 24/7.
    *   **VNPay Payment:** Thanh toán điện tử nhanh qua QR-Code hoặc ngân hàng.
    *   **Docker & AWS:** Triển khai hạ tầng cô lập, tối ưu tài nguyên và dễ dàng mở rộng.
*   **Hình ảnh gợi ý đưa vào:** Biểu đồ tư duy (Mindmap) hoặc 4 ô màu sắc (Grid) đại diện cho 4 trục giải pháp chính.
*   **Lời thuyết trình (Presenter Script):**
    > "Em đề xuất mô hình giải pháp PD-Shop hội tụ 4 điểm nhấn công nghệ quan trọng: Sử dụng WebAR nâng cao trải nghiệm mua sắm thực tế ảo; tích hợp AI Chatbot giảm tải nhân sự chăm sóc khách hàng; áp dụng cổng VNPay bảo vệ dòng tiền giao dịch; và triển khai trên hạ tầng Docker & AWS EC2 bảo đảm tính sẵn sàng cao của hệ thống."

---

### Slide 5: Kiến trúc tổng thể hệ thống
*   **Nội dung hiển thị:**
    *   **Kiến trúc 3 Lớp chuẩn:** Presentation Layer, Business Logic Layer, Data Layer.
    *   **Nginx Reverse Proxy:** Nhận request cổng 80, serve React tĩnh và proxy ngầm `/api` tới Spring Boot (cổng 8080).
    *   **Database & Storage:** MySQL 8.0 lưu trữ quan hệ và AWS S3 lưu trữ file ảnh, mô hình 3D.
*   **Hình ảnh gợi ý đưa vào:** **Bắt buộc chụp hình sơ đồ Kiến trúc hệ thống tổng thể** trong phần [III. Kiến trúc hệ thống] của báo cáo.
*   **Lời thuyết trình (Presenter Script):**
    > "Thưa thầy cô, đây là kiến trúc tổng thể hệ thống được em triển khai thực tế. Hệ thống tuân thủ kiến trúc phân tầng chuẩn. Nginx đứng ngoài cùng làm Reverse Proxy để bảo mật và phân phối dữ liệu tĩnh React. Mọi API nghiệp vụ được điều hướng tới Spring Boot Backend. Dữ liệu quan hệ lưu giữ tại MySQL, riêng các assets nặng như mô hình 3D hay hình ảnh được đẩy lên AWS S3 nhằm giảm tải lưu trữ cho server chính."

---

### Slide 6: Công nghệ sử dụng
*   **Nội dung hiển thị (Dạng Icon hoặc Logo công nghệ):**
    *   **Frontend:** ReactJS 18, Tailwind CSS, model-viewer (Google), Recharts.
    *   **Backend:** Spring Boot 3.3.0, Spring Security (JWT), Hibernate/JPA.
    *   **Database & Migration:** MySQL 8.0, Flyway database version control.
    *   **DevOps:** Docker, Docker Compose, Nginx, AWS EC2, AWS S3, GitHub Actions.
*   **Hình ảnh gợi ý đưa vào:** Logo ghép của React, Spring Boot, Docker, MySQL và AWS.
*   **Lời thuyết trình (Presenter Script):**
    > "Về mặt công nghệ, em sử dụng ngôn ngữ Java 17 kết hợp Spring Boot 3.3 làm backend do tính ổn định và bảo mật cao. Frontend được xây dựng bằng ReactJS giúp tối ưu hóa render SPA. Hạ tầng sử dụng MySQL 8.0 quản lý bởi Flyway. Toàn bộ quy trình đóng gói và vận hành dựa trên hệ sinh thái Docker và hạ tầng đám mây AWS."

---

### Slide 7: Phân tích và thiết kế hệ thống
*   **Nội dung hiển thị:**
    *   **Tác nhân hệ thống (Actors):** Admin (Quản trị), Staff (Nhân viên đơn hàng), Customer (Khách mua sắm).
    *   **Use Case cốt lõi:** Quản lý giỏ hàng, đặt hàng, xem AR 3D, chat AI, và thống kê doanh thu.
    *   **Sơ đồ tuần tự (Sequence Diagram):** Minh họa sự tương tác chặt chẽ giữa Khách hàng, Client React, Backend API và Cổng VNPay.
*   **Hình ảnh gợi ý đưa vào:** **Chụp hình Sơ đồ Use Case tổng thể** hoặc **Sơ đồ tuần tự nghiệp vụ thanh toán/đặt hàng** trong file báo cáo chi tiết của bạn.
*   **Lời thuyết trình (Presenter Script):**
    > "Trước khi bắt tay vào code, em tiến hành phân tích thiết kế hệ thống. Hệ thống phân vai rõ ràng cho 3 nhóm đối tượng truy cập. Trên slide là sơ đồ tuần tự thể hiện sự giao tiếp chặt chẽ và an toàn giữa Client React, Backend API và cổng thanh toán VNPay khi khách hàng thực hiện giao dịch."

---

### Slide 8: Thiết kế cơ sở dữ liệu
*   **Nội dung hiển thị:**
    *   **Mô hình quan hệ (RDBMS):** Gồm khoảng 20 bảng chuẩn hóa mức 3NF.
    *   **Nhóm bảng RBAC:** Phân quyền người dùng dựa trên vai trò và quyền hạn chi tiết.
    *   **Nhóm bảng Sản phẩm & AR:** Thiết kế cho phép một sản phẩm có nhiều biến thể màu sắc/kích cỡ và nhiều định dạng tệp 3D (.glb và .usdz).
*   **Hình ảnh gợi ý đưa vào:** **Bắt buộc chụp hình Sơ đồ thực thể liên kết (ERD)** từ cơ sở dữ liệu của bạn trong báo cáo.
*   **Lời thuyết trình (Presenter Script):**
    > "Đây là lược đồ cơ sở dữ liệu ERD của hệ thống PD-Shop với gần 20 bảng dữ liệu. Em đã tối ưu hóa lược đồ đạt chuẩn 3NF để tránh trùng lặp dữ liệu. Đặc biệt, em thiết kế bảng `product_ar_assets` riêng biệt giúp một sản phẩm có thể liên kết động tới nhiều file mô hình 3D định dạng khác nhau để phục vụ đa nền tảng thiết bị di động."

---

### Slide 9: Thiết kế bảo mật
*   **Nội dung hiển thị:**
    *   **Stateless JWT Auth:** Token mã hóa chứa quyền hạn được kiểm tra ngầm qua `AuthTokenFilter`.
    *   **Rate Limiting:** Sử dụng thư viện `Bucket4j` chặn spam brute-force (5 requests/phút/IP).
    *   **Google OAuth2:** Tích hợp đăng nhập nhanh qua Google API và đồng bộ user tự động.
    *   **Mật khẩu BCrypt:** Cost factor 10 bảo đảm mật khẩu không bị giải mã ngược.
*   **Hình ảnh gợi ý đưa vào:** Sơ đồ luồng xác thực JWT (Client gửi login -> Server verify -> Trả JWT -> Client đính kèm JWT vào Authorization Header cho các request sau).
*   **Lời thuyết trình (Presenter Script):**
    > "Về bảo mật, em áp dụng cơ chế Stateless JWT giúp hệ thống không cần lưu trữ session trên server RAM. Các request sau đăng nhập bắt buộc đi qua AuthTokenFilter để giải mã kiểm tra tính hợp lệ. Đặc biệt, em triển khai thêm Rate Limit Filter dùng Bucket4j giúp chặn đứng các đợt tấn công spam đăng nhập hoặc brute-force trực tiếp tại cổng API."

---

### Slide 10: Chức năng nghiệp vụ nổi bật
*   **Nội dung hiển thị:**
    *   **Khách hàng:** Duyệt sản phẩm đa chiều, giỏ hàng động, đặt hàng thông minh, áp mã coupon giảm giá.
    *   **Admin Dashboard:** Thống kê doanh thu thời gian thực, quản lý trạng thái đơn hàng.
    *   **Excel Batch Import:** Đọc file Excel bằng Apache POI, ghi database hàng loạt (Batch Insert) nâng cao tốc độ import hàng ngàn sản phẩm.
*   **Hình ảnh gợi ý đưa vào:** Chụp màn hình trang chủ bán hàng và trang Dashboard thống kê doanh thu của Admin.
*   **Lời thuyết trình (Presenter Script):**
    > "PD-Shop cung cấp đầy đủ các tính năng mua sắm hiện đại. Đối với khách hàng là luồng chọn sản phẩm, giỏ hàng, áp mã giảm giá và thanh toán. Đối với ban quản trị, hệ thống cung cấp Dashboard thống kê trực quan bằng biểu đồ Recharts và đặc biệt là tính năng Import sản phẩm hàng loạt từ Excel được tối ưu hóa Batch Saving giúp tiết kiệm kết nối database tối đa."

---

### Slide 11: Công nghệ WebAR
*   **Nội dung hiển thị:**
    *   **WebXR API & `<model-viewer>`:** Hiển thị 3D/AR trực tiếp trên Web, không cần cài đặt app.
    *   **Hỗ trợ đa nền tảng di động:**
        *   Android: Sử dụng định dạng tệp **.glb** (Scene Viewer).
        *   iOS (Apple): Sử dụng định dạng tệp **.usdz** (Quick Look).
    *   **Draco Compression:** Thuật toán nén mô hình 3D giúp giảm dung lượng tệp tới 80%.
*   **Hình ảnh gợi ý đưa vào:** Chụp ảnh màn hình điện thoại khi quét AR đặt một sản phẩm 3D (ví dụ: chiếc ghế hoặc thiết bị) lên sàn nhà thực tế.
*   **Lời thuyết trình (Presenter Script):**
    > "Điểm nhấn sáng tạo của đồ án là tính năng WebAR. Sử dụng thẻ model-viewer kết hợp WebXR API, khách hàng có thể dùng điện thoại Android hoặc iPhone quét mặt phẳng để đặt mô hình 3D của sản phẩm vào thực tế phòng khách với tỷ lệ chuẩn 1:1. Để bảo đảm tải nhanh trên mạng di động, em đã tích hợp thuật toán nén Draco giúp giảm đáng kể dung lượng file 3D mà không làm giảm độ sắc nét."

---

### Slide 12: Chatbot AI hỗ trợ
*   **Nội dung hiển thị:**
    *   **Google Gemini API:** Sử dụng mô hình ngôn ngữ lớn để giao tiếp thông minh.
    *   **Context Injection:** Backend tự động truy vấn danh sách sản phẩm thực tế trong DB và nhúng vào ngữ cảnh hội thoại gửi tới Gemini.
    *   **Prompt Engineering:** Định cấu hình hệ thống (System Instructions) bắt buộc AI đóng vai trợ lý PD-Shop, chỉ trả lời về sản phẩm của cửa hàng và từ chối các câu hỏi lạc đề.
*   **Hình ảnh gợi ý đưa vào:** Chụp giao diện khung Chat AI tư vấn trên trang web PD-Shop (Ví dụ: khách hàng hỏi: 'Shop có bán áo khoác không?' và AI trả lời chính xác thông tin áo đang bán).
*   **Lời thuyết trình (Presenter Script):**
    > "Hệ thống hỗ trợ khách hàng mua sắm thông qua trợ lý ảo Chatbot AI tích hợp Gemini API. Thay vì trả lời chung chung, backend của em áp dụng kỹ thuật Context Injection: tự động đọc danh sách sản phẩm trong kho và nhét vào prompt gửi đi. Em cũng thiết kế prompt định hình AI chỉ được trả lời thông tin của PD-Shop để tránh tình trạng AI trả lời lạc đề hoặc bị lợi dụng trả lời các câu hỏi không liên quan."

---

### Slide 13: Triển khai hệ thống lên AWS Cloud
*   **Nội dung hiển thị:**
    *   **Dockerization:** Đóng gói dịch vụ thành 3 container riêng biệt chạy chung Docker network.
    *   **AWS EC2 & S3:** Hosting hệ thống trên máy ảo Ubuntu và lưu trữ đa phương tiện trên S3.
    *   **CORS & Reverse Proxy:** Nginx xử lý HTTPS/SSL và định tuyến bảo vệ API.
    *   **Tối ưu build:** Build file JAR local và upload qua SCP để tránh tràn RAM/disk trên server EC2 t2.micro.
*   **Hình ảnh gợi ý đưa vào:** **Bắt buộc chụp hình sơ đồ Deploy hệ thống trên Docker & AWS EC2** trong phần báo cáo.
*   **Lời thuyết trình (Presenter Script):**
    > "Đồ án đã được em triển khai thực tế trên máy chủ AWS EC2. Toàn bộ ứng dụng được đóng gói qua Docker Compose giúp cô lập tài nguyên. Do giới hạn phần cứng của gói EC2 Free Tier rất yếu, em đã thiết kế quy trình build file JAR/dist tĩnh ở máy local rồi upload qua SCP thay vì build trực tiếp trên server, giúp giảm thời gian build từ 5 phút xuống còn 30 giây và không gây treo đơ hệ thống."

---

### Slide 14: Kết quả đạt được
*   **Nội dung hiển thị:**
    *   **Về chức năng:** Hoàn thành 100% các tính năng nghiệp vụ khách hàng, admin, WebAR, AI chatbot và thanh toán VNPay.
    *   **Số liệu kỹ thuật:**
        *   Hệ thống Backend: ~165 file mã nguồn Java.
        *   Hệ thống Frontend: ~80+ components ReactJS.
        *   Môi trường thực tế: Triển khai hoạt động ổn định trực tuyến trên AWS.
    *   **Kiểm thử (Testing):** Hoàn thành Unit Test, Functional Test và Security Test đạt kết quả đúng kỳ vọng.
*   **Hình ảnh gợi ý đưa vào:** Bảng thống kê trạng thái hoàn thành các tính năng trong báo cáo (dạng Checkmark xanh).
*   **Lời thuyết trình (Presenter Script):**
    > "Kính thưa Hội đồng, đồ án của em đã hoàn thành 100% các chức năng đề ra và được kiểm thử kỹ lưỡng. Về mặt số liệu, hệ thống bao gồm hơn 165 file Java backend và hơn 80 components React. Ứng dụng đã chạy thực tế trực tuyến ổn định, các chức năng thanh toán VNPay và quét AR hoạt động hoàn toàn chính xác trên môi trường thật."

---

### Slide 15: Ưu điểm nổi bật
*   **Nội dung hiển thị (Trực quan - Dạng Huy chương hoặc Tích xanh):**
    *   **Độc đáo:** Áp dụng WebAR 3D giúp nâng cao trải nghiệm thực tế vượt bậc.
    *   **Thông minh:** Chatbot AI cá nhân hóa theo sản phẩm thực tế của cửa hàng.
    *   **Bảo mật:** Hệ thống an toàn cao với phân quyền RBAC và chống spam IP Rate Limiting.
    *   **Thực tế:** Hệ thống deploy thực tế thành công trên AWS, tối ưu tài nguyên phần cứng tốt.
*   **Hình ảnh gợi ý đưa vào:** Hình ảnh biểu trưng cho sự hoàn thiện công nghệ (ví dụ: Biểu tượng bảo mật ghép với biểu tượng đám mây và AR).
*   **Lời thuyết trình (Presenter Script):**
    > "Em xin tự đánh giá các ưu điểm nổi bật của hệ thống PD-Shop: Đó là tính trực quan đột phá nhờ WebAR; tính thông minh tự động hóa nhờ Gemini AI; tính an toàn bảo mật chuẩn công nghiệp của Spring Security và Rate Limiting; và cuối cùng là tính thực tiễn cao khi ứng dụng được vận hành thật trên hạ tầng điện toán đám mây."

---

### Slide 16: Hạn chế của hệ thống
*   **Nội dung hiển thị:**
    *   **Giới hạn Token AI:** Đưa toàn bộ sản phẩm dạng text vào Prompt có thể gây tràn giới hạn Token khi cửa hàng có hàng vạn sản phẩm.
    *   **Nguồn mô hình 3D:** Admin vẫn phải tự thiết kế và đăng tải thủ công các tệp GLB/USDZ lên hệ thống.
    *   **Hạ tầng Free Tier:** Cấu hình server AWS EC2 Free Tier còn yếu, giới hạn băng thông khi nhiều người truy cập AR cùng lúc.
*   **Hình ảnh gợi ý đưa vào:** Biểu tượng cảnh báo (Warning) hoặc hình ảnh mô tả giới hạn phần cứng/băng thông.
*   **Lời thuyết trình (Presenter Script):**
    > "Bên cạnh các kết quả đạt được, đồ án vẫn còn một số hạn chế nhất định. Phương pháp Context Injection cho AI hiện tại chỉ phù hợp với quy mô cửa hàng nhỏ và vừa; nếu số lượng sản phẩm lên tới hàng vạn sẽ bị tràn giới hạn token của Gemini API. Ngoài ra, việc thiết kế mô hình 3D vẫn phụ thuộc hoàn toàn vào nguồn tài nguyên thủ công do admin đăng tải lên."

---

### Slide 17: Hướng phát triển
*   **Nội dung hiển thị:**
    *   **Tích hợp PGVector / Pinecone:** Áp dụng kiến trúc RAG nâng cao cho Chatbot AI để tra cứu ngữ nghĩa sản phẩm chính xác, tối ưu token.
    *   **Generative AI 3D:** Sử dụng AI tự động tạo mô hình 3D từ ảnh chụp 2D của sản phẩm.
    *   **Hạ tầng nâng cao:** Cấu hình HTTPS SSL chính thức, thiết lập **Load Balancer** và **Auto Scaling** tự động co giãn tài nguyên trên AWS.
*   **Hình ảnh gợi ý đưa vào:** Sơ đồ hướng phát triển công nghệ (RAG Architecture / Load Balancing).
*   **Lời thuyết trình (Presenter Script):**
    > "Để giải quyết các hạn chế đó, hướng phát triển tiếp theo của em là tích hợp cơ sở dữ liệu Vector để làm RAG nâng cao cho chatbot AI, tối ưu hóa việc gửi dữ liệu sản phẩm. Em cũng hướng tới việc cấu hình HTTPS SSL bảo mật đường truyền và thiết lập hệ thống Load Balancer cùng Auto Scaling trên AWS để sẵn sàng đáp ứng lượng người dùng lớn hơn."

---

### Slide 18: Kết luận & Q&A (Trang cuối)
*   **Nội dung hiển thị:**
    *   **KẾT LUẬN:** Đồ án hoàn thành đúng hạn, áp dụng thành công các công nghệ mới nổi (AI, AR) vào nghiệp vụ thương mại điện tử thực tế.
    *   **HỎI & ĐÁP:** Xin chân thành cảm ơn Thầy / Cô trong Hội đồng!
*   **Hình ảnh gợi ý đưa vào:** Chữ "Q&A" thiết kế nghệ thuật cùng lời cảm ơn.
*   **Lời thuyết trình (Presenter Script):**
    > "Đồ án tốt nghiệp này là cơ hội lớn để em trải nghiệm toàn bộ vòng đời phát triển phần mềm thực tế. Em xin chân thành cảm ơn quý thầy cô trong Hội đồng đã dành thời gian lắng nghe. Em xin phép được nhận các câu hỏi chất vấn và ý kiến đóng góp từ thầy cô để hoàn thiện đồ án này tốt hơn. Em xin cảm ơn."

---

## PHẦN B: 15 CÂU HỎI PHẢN BIỆN CHUYÊN SÂU & GỢI Ý TRẢ LỜI CHO HỘI ĐỒNG

Đây là 15 câu hỏi xoáy sâu vào code, bảo mật, hạ tầng và giải pháp công nghệ của PD-Shop mà các thầy cô hội đồng hay hỏi nhất:

### Câu 1: Em hãy giải thích lý do tại sao em chọn Nginx làm Reverse Proxy đứng trước Spring Boot mà không kết nối trực tiếp?
*   **Câu trả lời mẫu:**
    > "Thưa thầy cô, em chọn Nginx làm Reverse Proxy vì 3 lý do bảo mật và hiệu năng:
    > 1. **Bảo mật hạ tầng:** Nginx giúp che giấu cổng chạy thực tế của Spring Boot (8080). Client chỉ giao tiếp qua cổng 80/443 của Nginx, ngăn chặn tấn công dò quét cổng trực tiếp vào backend.
    > 2. **Giải quyết CORS:** Nginx serve file tĩnh React tại port 80 và proxy các request `/api` về Spring Boot backend. Đối với trình duyệt, toàn bộ ứng dụng chạy chung một domain và port, giúp triệt tiêu hoàn toàn lỗi CORS mà không cần cấu hình phức tạp ở backend.
    > 3. **Tối ưu hiệu năng:** Nginx có khả năng xử lý static files (HTML, CSS, JS, ảnh) cực kỳ nhanh với tài nguyên tối thiểu, giúp Spring Boot giải phóng tài nguyên CPU/RAM để chỉ tập trung tính toán logic nghiệp vụ."

---

### Câu 2: Trong báo cáo em có đề cập lỗi Jackson Hibernate Proxy Serialization. Hãy giải thích nguyên nhân sâu xa và tại sao annotation `@JsonIgnoreProperties` lại giải quyết được?
*   **Câu trả lời mẫu:**
    > "Dạ thưa thầy cô, nguyên nhân sâu xa là do mối quan hệ giữa các Entity trong JPA (ví dụ giữa `Product` và `Brand`) được cấu hình nạp dữ liệu trì hoãn là `FetchType.LAZY`. 
    > Khi em truy vấn Product, Hibernate không nạp ngay Brand mà tạo ra một đối tượng Brand giả lập (Hibernate Proxy Object) để giữ chỗ. 
    > Khi Spring Boot chuyển đổi thực thể Product sang chuỗi JSON để trả về API, thư viện Jackson ObjectMapper sẽ quét qua đối tượng và cố gắng chuyển đổi tất cả các thuộc tính của đối tượng Brand Proxy này (bao gồm cả các trường kỹ thuật nội bộ của Hibernate là `hibernateLazyInitializer` và `handler`). Do lúc này Session JPA đã đóng, việc truy cập các thuộc tính proxy này gây ra lỗi `HttpMessageNotWritableException` (lỗi 500).
    > Việc em thêm `@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})` báo cho thư viện Jackson bỏ qua không serialize hai trường proxy này, từ đó giúp Jackson chuyển đổi đối tượng sang JSON thành công mà không bị lỗi."

---

### Câu 3: Em hãy giải thích cơ chế khóa lạc quan (Optimistic Locking) bằng `@Version` trong entity `Inventory`. Điều gì xảy ra khi xảy ra tranh chấp số lượng tồn kho?
*   **Câu trả lời mẫu:**
    > "Thưa thầy cô, Optimistic Locking là cơ chế kiểm soát truy cập đồng thời mà không cần khóa cứng bảng dữ liệu (như Pessimistic Lock), giúp tăng hiệu năng hệ thống.
    > Em thêm thuộc tính `version` kiểu số nguyên trong Entity `Inventory` và đánh dấu bằng `@Version`. 
    > **Cơ chế hoạt động:** Khi khách hàng A và B cùng đọc thông tin một sản phẩm có tồn kho là 10, version là 1.
    > * Khách A thanh toán trước, Hibernate chạy lệnh cập nhật: `UPDATE inventory SET stock = 9, version = 2 WHERE id = 1 AND version = 1`. Lệnh này thành công vì version trong DB vẫn đang là 1.
    > * Khách B thanh toán ngay sau đó, Hibernate chạy lệnh: `UPDATE inventory SET stock = 9, version = 2 WHERE id = 1 AND version = 1`. Câu lệnh này cập nhật thất bại (số dòng cập nhật bằng 0) vì version thực tế trong DB lúc này đã là 2 (do khách A cập nhật).
    > Ngay lập tức, JPA ném ra lỗi `ObjectOptimisticLockingFailureException`. Lỗi này được bắt tập trung tại `GlobalExceptionHandler` để thông báo cho khách hàng B biết dữ liệu đã thay đổi và yêu cầu họ làm mới trang để thực hiện lại, đảm bảo kho không bao giờ bị trừ âm hoặc sai lệch."

---

### Câu 4: Làm thế nào để đảm bảo tính an toàn dữ liệu thanh toán khi tích hợp cổng VNPay? Nếu người dùng cố tình thay đổi số tiền trên URL thanh toán thì hệ thống xử lý thế nào?
*   **Câu trả lời mẫu:**
    > "Thưa thầy cô, để bảo đảm an toàn dữ liệu thanh toán, em áp dụng cơ chế xác thực chữ ký điện tử song phương:
    > 1. **Chữ ký số phía gửi:** Khi tạo yêu cầu thanh toán, Backend gộp toàn bộ các tham số giao dịch (bao gồm cả số tiền `vnp_Amount`, mã đơn hàng `vnp_TxnRef`) sắp xếp theo thứ tự alphabet, sau đó thực hiện mã hóa băm bằng thuật toán **HMAC-SHA512** sử dụng mã bí mật **Hash Secret Key** được VNPay cấp riêng cho cửa hàng để tạo ra tham số `vnp_SecureHash` đính kèm lên URL. Nếu người dùng cố tình thay đổi số tiền trên URL thanh toán, chữ ký số gửi sang hệ thống VNPay sẽ không trùng khớp và VNPay sẽ từ chối giao dịch ngay lập tức.
    > 2. **Xác thực phía nhận (IPN API):** Khi khách hàng thanh toán xong, VNPay gọi ngầm về API IPN của Backend để cập nhật trạng thái đơn hàng. Backend thực hiện sắp xếp và băm lại các tham số nhận được bằng thuật toán HMAC-SHA512 để đối chiếu chữ ký số do VNPay gửi qua. Đồng thời, Backend thực hiện kiểm tra chéo: đối chiếu mã đơn hàng xem có tồn tại không, so khớp số tiền thực tế trong database có khớp với số tiền VNPay báo đã thanh toán hay không. Chỉ khi mọi thông tin trùng khớp, trạng thái đơn hàng mới được cập nhật thành 'Đã thanh toán'."

---

### Câu 5: Tại sao em lại cấu hình phương thức ghi nhật ký hệ thống (Audit Log) chạy bất đồng bộ `@Async` và sử dụng cơ chế transaction `REQUIRES_NEW`?
*   **Câu trả lời mẫu:**
    > "Thưa thầy cô, đây là quyết định thiết kế cốt lõi để bảo đảm hiệu năng và tính toàn vẹn của nhật ký hoạt động:
    > 1. **Sử dụng `@Async`:** Việc ghi log lịch sử là tác vụ phụ, không được phép làm chậm luồng xử lý chính của người dùng. Chú thích `@Async` giúp đẩy tác vụ ghi log sang một luồng (thread) xử lý ngầm riêng biệt, giúp API trả kết quả về cho Admin ngay lập tức mà không cần đợi lưu log thành công.
    > 2. **Sử dụng `Propagation.REQUIRES_NEW`:** Khi một admin thực hiện cập nhật sản phẩm nhưng thao tác đó bị lỗi ở DB khiến giao dịch (transaction) nghiệp vụ chính bị rollback (hoàn tác). Nếu dùng chung transaction, dòng log ghi nhận hành vi cũng sẽ bị rollback mất. Sử dụng `REQUIRES_NEW` giúp tạo ra một transaction hoàn toàn mới và độc lập. Do đó, dù giao dịch cập nhật sản phẩm thất bại, thông tin Admin đó đã cố gắng thực hiện hành vi cập nhật vẫn được lưu lại an toàn trong DB, phục vụ cho việc kiểm toán bảo mật."

---

### Câu 6: Rate Limiting của em hoạt động ở tầng Filter nào? Cơ chế hoạt động của thuật toán Token Bucket trong Bucket4j là gì?
*   **Câu trả lời mẫu:**
    > "Thưa thầy cô, `RateLimitFilter` của em được đăng ký chạy trước filter `UsernamePasswordAuthenticationFilter` trong Spring Security để ngăn chặn request spam ngay từ cổng vào của hệ thống.
    > **Cơ chế hoạt động:** Thuật toán Token Bucket định nghĩa một chiếc 'xô' chứa tối đa $N$ token (hệ thống của em cấu hình $N = 5$ tokens). 
    > * Mỗi IP client gửi request lên sẽ tương ứng với một chiếc xô được lưu giữ trong `ConcurrentHashMap`.
    > * Mỗi request thành công sẽ tiêu thụ 1 token trong xô.
    > * Các token sẽ được tự động nạp đầy lại vào xô sau một khoảng thời gian cấu hình (hệ thống nạp đầy 5 tokens sau mỗi 1 phút).
    > * Nếu người dùng gửi yêu cầu dồn dập vượt quá 5 lần/phút, xô sẽ hết token và filter sẽ chặn lại ngay, trả về mã HTTP 429 Too Many Requests mà không cần xử lý xuống database, giúp bảo vệ tài nguyên RAM/CPU cho máy chủ."

---

### Câu 7: Tại sao em sử dụng Server-Sent Events (SSE) cho phần thông báo thời gian thực (Real-time Notification) thay vì WebSocket?
*   **Câu trả lời mẫu:**
    > "Thưa thầy cô, em chọn Server-Sent Events (SSE) thay vì WebSocket vì các lý do sau:
    > 1. **Đặc thù tính năng:** Tính năng thông báo trong hệ thống PD-Shop là truyền dữ liệu một chiều (Unidirectional) từ Server đẩy về Client (ví dụ: thông báo có đơn hàng mới cho admin, cập nhật trạng thái đơn cho khách). Client không cần truyền ngược dữ liệu lên Server qua kênh này.
    > 2. **Đơn giản & Tương thích:** SSE chạy trên giao thức HTTP tiêu chuẩn, không cần thực hiện bắt tay nâng cấp giao thức (Handshake upgrade) như WebSocket. Do đó, nó dễ dàng cấu hình đi qua các hệ thống tường lửa, Reverse Proxy (như Nginx) mà không bị chặn.
    > 3. **Tính năng tích hợp sẵn:** SSE tự động hỗ trợ cơ chế tự động kết nối lại (Auto-reconnect) khi kết nối mạng bị gián đoạn, điều mà WebSocket phải tự viết code xử lý thủ công."

---

### Câu 8: model-viewer hiển thị mô hình 3D trên nền tảng Web như thế nào? Cách giải quyết dung lượng tệp 3D lớn để tải nhanh trên di động là gì?
*   **Câu trả lời mẫu:**
    > "Thưa thầy cô, thẻ `<model-viewer>` của Google hoạt động dựa trên thư viện WebGL và Three.js chạy ngầm bên dưới để kết xuất (render) mô hình 3D trực tiếp trên Canvas của trình duyệt Web. Để hiển thị AR ngoài đời thật, nó sử dụng WebXR Device API để giao tiếp với camera phần cứng.
    > **Giải pháp tối ưu dung lượng tệp 3D:**
    > 1. **Nén Draco Compression:** Em sử dụng thuật toán Draco để nén cấu trúc lưới hình học (mesh) và tọa độ đỉnh của mô hình 3D. Draco giúp nén dung lượng file từ 10MB-20MB xuống chỉ còn 1MB-2MB (giảm tới 80%) mà không làm suy giảm chất lượng hiển thị mắt thường.
    > 2. **Lưu trữ CDN/AWS S3:** File 3D sau khi nén được lưu trữ độc lập trên AWS S3 giúp tải song song nhanh chóng, không tốn băng thông và dung lượng ổ cứng của server API chính."

---

### Câu 9: Hãy giải thích cách em triển khai Chatbot AI sử dụng Gemini API. Làm thế nào để AI chỉ trả lời về sản phẩm của PD-Shop mà không trả lời các câu hỏi khác?
*   **Câu trả lời mẫu:**
    > "Thưa thầy cô, em triển khai Chatbot AI bằng cách gọi REST API tới Google Gemini API từ backend Spring Boot:
    > 1. **Context Injection:** Khi khách hàng gửi câu hỏi chat, Backend sẽ tự động truy vấn danh sách tên sản phẩm, thương hiệu và mô tả ngắn hiện có trong cơ sở dữ liệu MySQL, gộp thành dạng text thô làm ngữ cảnh (Context).
    > 2. **Prompt Engineering:** Em viết System Instructions (chỉ thị hệ thống) bắt buộc gửi kèm trong mọi request gửi tới Gemini. Chỉ thị có nội dung định hình vai trò: *'Bạn là trợ lý ảo hỗ trợ khách hàng của PD-Shop. Bạn chỉ được phép sử dụng danh sách sản phẩm được cung cấp dưới đây để trả lời. Nếu khách hàng hỏi các câu hỏi ngoài phạm vi cửa hàng hoặc yêu cầu làm việc khác, hãy từ chối lịch sự và hướng dẫn họ mua sắm.'*
    > Nhờ cơ chế này, AI được khoanh vùng dữ liệu trả lời và không bị khai thác trả lời các thông tin sai lệch ngoài đồ án."

---

### Câu 10: Quy trình triển khai Docker Compose trên AWS EC2 được em thực hiện như thế nào? Tại sao em lại phải build file JAR ở local rồi mới upload lên server?
*   **Câu trả lời mẫu:**
    > "Thưa thầy cô, quy trình triển khai như sau: Em viết file `docker-compose.yml` định nghĩa 3 service: `pdshop_nginx` (cổng 80), `pdshop_app` (cổng 8080) và `pdshop_mysql` (cổng 3306) chạy chung trong một Docker bridge network có cấu hình volume để lưu trữ lâu dài dữ liệu DB và ảnh upload.
    > **Lý do phải build JAR ở local:**
    > Máy chủ AWS EC2 em sử dụng là gói Free Tier (t2.micro) chỉ có cấu hình tối thiểu là 1 vCPU và 1GB RAM. 
    > Nếu thực hiện kéo code từ git về và chạy lệnh build trực tiếp trên server, trình biên dịch Maven và Node compiler sẽ ngốn sạch RAM và ổ cứng làm server bị cạn kiệt tài nguyên dẫn đến treo đơ hệ thống hoàn toàn.
    > Do đó, em chọn giải pháp tối ưu: Chạy `mvn clean package` và `npm run build` ở máy local cấu hình mạnh để sinh ra file JAR backend (~127MB) và thư mục build frontend. Sau đó dùng lệnh `scp` chỉ tải các file đóng gói này lên EC2 và ra lệnh cho Docker build image từ file JAR đã có sẵn. Quá trình này giúp tiết kiệm 1.5GB ổ cứng server và giảm thời gian deploy xuống còn 30 giây."

---

### Câu 11: Em hãy phân biệt sự khác biệt giữa Role (Vai trò) và Authority/Permission (Quyền hạn) trong SecurityConfig và cách phân quyền trong hệ thống?
*   **Câu trả lời mẫu:**
    > "Thưa thầy cô, trong Spring Security:
    > * **Role (Vai trò):** Đại diện cho một nhóm người dùng (ví dụ: `ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_USER`). Trong cơ sở dữ liệu, tên Role bắt buộc phải có tiền tố `ROLE_`.
    > * **Authority/Permission (Quyền hạn):** Đại diện cho một hành động cụ thể mà người dùng được phép làm (ví dụ: `PRODUCT_CREATE`, `ORDER_UPDATE`, `REVIEW_DELETE`). Một Role có thể sở hữu nhiều Permission cụ thể.
    > **Phân quyền trong hệ thống:**
    > * Tại `SecurityConfig.java`, em bảo vệ các đường dẫn API diện rộng bằng Role: `.requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "STAFF")`.
    > * Tại các hàm nghiệp vụ chi tiết của Controller hoặc Service, em áp dụng phân quyền mức chi tiết dựa trên Permission để đảm bảo tính an toàn cao nhất: `@PreAuthorize("hasAuthority('PRODUCT_CREATE')")` giúp kiểm soát chính xác tác vụ tạo sản phẩm."

---

### Câu 12: Làm thế nào em tối ưu hóa tốc độ ghi dữ liệu khi thực hiện tính năng Import sản phẩm hàng loạt từ file Excel?
*   **Câu trả lời mẫu:**
    > "Thưa thầy cô, nếu import thông thường bằng cách duyệt từng dòng Excel rồi chạy hàm `save()` của JPA, hệ thống sẽ thực hiện hàng trăm kết nối và câu lệnh INSERT đơn lẻ tới DB, gây thắt nút cổ chai hiệu năng. Em đã tối ưu hóa bằng 2 kỹ thuật:
    > 1. **JDBC Batch Inserts:** Cấu hình thuộc tính `spring.jpa.properties.hibernate.jdbc.batch_size=50` trong `application.properties` để gộp 50 câu lệnh INSERT thành một lô (batch) gửi đi một lần.
    > 2. **Batch Save API:** Sử dụng phương thức `repository.saveAll(productList)` thay vì gọi `save()` đơn lẻ. Điều này giúp Hibernate gộp các câu lệnh INSERT hiệu quả, giảm số lượng kết nối mạng đến MySQL và tăng tốc độ import file Excel hàng ngàn dòng chỉ trong vài giây."

---

### Câu 13: Làm thế nào em đồng bộ tài khoản Google OAuth2 với hệ thống cơ sở dữ liệu của dự án?
*   **Câu trả lời mẫu:**
    > "Thưa thầy cô, quy trình đồng bộ được thực hiện tại lớp `CustomOAuth2UserService.java` sau khi người dùng xác thực thành công phía Google API:
    > 1. Hệ thống lấy thông tin Email của người dùng do Google trả về.
    > 2. Truy vấn vào bảng `users` trong cơ sở dữ liệu để tìm kiếm tài khoản theo email này.
    > 3. **Nếu email chưa tồn tại:** Hệ thống tự động tạo một dòng ghi mới trong bảng `users`, gán email đó làm username, đặt mật khẩu ngẫu nhiên được mã hóa BCrypt, thiết lập cờ `is_active = true` và liên kết với Role mặc định là `ROLE_USER`.
    > 4. **Nếu email đã tồn tại:** Hệ thống tiến hành cập nhật lại các thông tin cá nhân mới nhất như họ tên, ảnh đại diện từ Google.
    > 5. Cuối cùng, hệ thống tạo ra mã JWT Token tương ứng với tài khoản này để trả về cho Client, hoàn tất luồng đăng nhập nhanh."

---

### Câu 14: Tại sao em lại chọn MySQL làm cơ sở dữ liệu quan hệ cho dự án này thay vì các cơ sở dữ liệu NoSQL như MongoDB?
*   **Câu trả lời mẫu:**
    > "Thưa thầy cô, em chọn cơ sở dữ liệu quan hệ MySQL vì tính chất của một hệ thống thương mại điện tử (E-Commerce) yêu cầu tính toàn vẹn dữ liệu rất cao:
    > 1. **Giao dịch ACID:** Nghiệp vụ đặt hàng và thanh toán yêu cầu tính nhất quán tuyệt đối (ví dụ: khi thanh toán thành công thì phải đồng thời trừ tồn kho và tạo đơn hàng). MySQL hỗ trợ giao dịch ACID cực kỳ mạnh mẽ để tránh lỗi mất mát hoặc sai lệch số liệu.
    > 2. **Tính ràng buộc dữ liệu:** Các thực thể như Đơn hàng (`orders`), Sản phẩm (`products`), Khách hàng (`users`) có mối liên kết chặt chẽ. Hệ quản trị RDBMS giúp thực hiện các ràng buộc khóa ngoại (Foreign Keys) để bảo đảm không có đơn hàng mồ côi hoặc sản phẩm không thuộc danh mục nào, điều mà NoSQL như MongoDB khó kiểm soát chặt chẽ bằng schema tự nhiên."

---

### Câu 15: Nếu hệ thống PD-Shop có lượng truy cập tăng đột biến làm quá tải CPU/RAM của server AWS EC2 hiện tại, em sẽ đề xuất các giải pháp kiến trúc gì để giải quyết?
*   **Câu trả lời mẫu:**
    > "Thưa thầy cô, nếu hệ thống bị quá tải, em đề xuất 4 giải pháp nâng cấp kiến trúc sau:
    > 1. **Cấu hình Load Balancer & Auto Scaling:** Đưa Nginx hoặc AWS ALB làm bộ cân bằng tải đứng trước, cấu hình Auto Scaling để tự động khởi tạo thêm các instance EC2 backend chạy song song khi CPU vượt ngưỡng 75%.
    > 2. **Tích hợp Cache (Redis):** Đưa Redis Cache đứng trước MySQL để lưu trữ các thông tin ít thay đổi nhưng truy cập nhiều như danh mục sản phẩm, cấu hình thương hiệu, giúp giảm tải truy vấn trực tiếp vào DB tới 80%.
    > 3. **Tách biệt Database Read/Write (Replication):** Cấu hình mô hình MySQL Master-Slave (Master xử lý ghi dữ liệu đơn hàng, các Slave xử lý đọc/duyệt sản phẩm).
    > 4. **Sử dụng CDN (AWS CloudFront):** Đẩy toàn bộ hình ảnh và các tệp mô hình 3D AR nặng qua CDN để phân phối tới người dùng từ các điểm edge server gần nhất, giải phóng hoàn toàn băng thông cho EC2."
