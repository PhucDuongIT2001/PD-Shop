package com.example.demo.service;

import com.example.demo.entity.ChatMessage;
import com.example.demo.entity.ChatSession;
import com.example.demo.entity.User;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ChatMessageRepository;
import com.example.demo.repository.ChatSessionRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.entity.enums.ProductStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${GEMINI_API_KEY:}")
    private String geminiApiKey;

    public ChatService(ChatSessionRepository chatSessionRepository,
                       ChatMessageRepository chatMessageRepository,
                       UserRepository userRepository,
                       ProductRepository productRepository) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;

        // Khắc phục lỗi thiếu timeout cho RestTemplate ngoại vi
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000); // 5s connection timeout
        factory.setReadTimeout(15000);   // 15s read timeout
        this.restTemplate = new RestTemplate(factory);
    }

    /**
     * Lấy hoặc tạo mới một phiên chat của người dùng.
     */
    @Transactional
    public ChatSession getOrCreateSession(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        return chatSessionRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), "ACTIVE")
                .orElseGet(() -> {
                    ChatSession session = new ChatSession();
                    session.setUser(user);
                    session.setStatus("ACTIVE");
                    session.setCreatedAt(LocalDateTime.now());
                    return chatSessionRepository.save(session);
                });
    }

    /**
     * Lấy lịch sử chat của người dùng.
     */
    @Transactional
    public List<ChatMessage> getChatHistory(String username) {
        ChatSession session = getOrCreateSession(username);
        return chatMessageRepository.findByChatSessionIdOrderByCreatedAtAsc(session.getId());
    }

    /**
     * Gửi tin nhắn của người dùng tới AI và trả về phản hồi.
     */
    @Transactional
    public ChatMessage sendMessage(String username, String messageText) {
        ChatSession session = getOrCreateSession(username);

        // 1. Lưu tin nhắn của User
        ChatMessage userMessage = new ChatMessage();
        userMessage.setChatSession(session);
        userMessage.setSenderType("USER");
        userMessage.setMessageText(messageText);
        userMessage.setCreatedAt(LocalDateTime.now());
        chatMessageRepository.save(userMessage);

        // 2. Gọi Gemini API để lấy câu trả lời
        String botReplyText = callGeminiApi(session, messageText);

        // 3. Lưu tin nhắn của Bot
        ChatMessage botMessage = new ChatMessage();
        botMessage.setChatSession(session);
        botMessage.setSenderType("BOT");
        botMessage.setMessageText(botReplyText);
        botMessage.setCreatedAt(LocalDateTime.now());
        return chatMessageRepository.save(botMessage);
    }

    /**
     * Gọi API Gemini (hoặc trả về mock response nếu key không hợp lệ/rỗng).
     */
    private String callGeminiApi(ChatSession session, String latestUserMessage) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || "your_gemini_api_key_here".equals(geminiApiKey)) {
            return "👋 Xin chào! Tôi là Trợ lý AI của PD-SHOP. Hiện tại Gemini API Key chưa được cấu hình chính thức trong file .env của hệ thống. " +
                   "Tôi đang chạy ở chế độ Demo ngoại tuyến.\n\n" +
                   "Bạn vừa hỏi: \"" + latestUserMessage + "\". Khi API Key được cấu hình, tôi sẽ tư vấn chi tiết các sản phẩm công nghệ cho bạn!";
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Cấu trúc payload gửi lên Gemini
            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();

            // 1. Gửi System Instruction dưới dạng Context đầu tiên
            Map<String, Object> systemPrompt = new HashMap<>();
            systemPrompt.put("role", "user");
            
            String productsContext = getProductsContext();
            String systemInstruction = 
                "Bối cảnh: Bạn là một Trợ lý AI chuyên nghiệp, thân thiện và am hiểu công nghệ của cửa hàng PD-SHOP. " +
                "Nhiệm vụ của bạn là tư vấn cho khách hàng các sản phẩm laptop, điện thoại, phụ kiện công nghệ, " +
                "giải đáp các thông số kỹ thuật, chính sách bảo hành và giao hàng của PD-SHOP. " +
                "Hãy trả lời bằng tiếng Việt lịch sự, ngắn gọn, dễ thương và có biểu tượng cảm xúc (emoji) phù hợp.\n\n" +
                "Dưới đây là thông tin về các sản phẩm thực tế đang bán tại cửa hàng PD-SHOP. Bạn hãy ƯU TIÊN tư vấn các sản phẩm này cho khách hàng:\n" +
                productsContext + "\n\n" +
                "QUY TẮC QUAN TRỌNG VỀ HIỂN THỊ SẢN PHẨM:\n" +
                "Khi bạn giới thiệu hoặc gợi ý bất kỳ sản phẩm nào có trong danh sách trên cho khách hàng, bạn PHẢI hiển thị thông tin sản phẩm dưới dạng một thẻ đặc biệt đặt trên một dòng riêng biệt theo đúng cú pháp sau:\n" +
                "[PRODUCT:<Chi tiết JSON của sản phẩm>]\n" +
                "Ví dụ: Nếu giới thiệu sản phẩm có trường Chi tiết là `{\"id\":1,\"name\":\"iPhone 17 Pro Max\",\"price\":\"35.990.000đ\",\"thumbnail\":\"iphone17.jpg\"}`, bạn phải viết đúng dạng (trên một dòng riêng biệt):\n" +
                "[PRODUCT:{\"id\":1,\"name\":\"iPhone 17 Pro Max\",\"price\":\"35.990.000đ\",\"thumbnail\":\"iphone17.jpg\"}]\n" +
                "Lưu ý: Hãy sao chép chính xác 100% nội dung JSON trong trường 'Chi tiết' được cung cấp mà không được chỉnh sửa cấu trúc của nó. Bạn có thể giải thích thêm thông tin trước hoặc sau thẻ PRODUCT này, nhưng bản thân thẻ này phải nằm độc lập trên dòng của nó.";

            systemPrompt.put("parts", List.of(Map.of("text", systemInstruction)));
            contents.add(systemPrompt);

            Map<String, Object> systemResponse = new HashMap<>();
            systemResponse.put("role", "model");
            systemResponse.put("parts", List.of(Map.of("text", 
                "Tôi đã hiểu bối cảnh và vai trò của mình. Tôi là trợ lý ảo chính thức của PD-SHOP và sẵn sàng hỗ trợ khách hàng mua sắm công nghệ."
            )));
            contents.add(systemResponse);

            // 2. Thêm lịch sử hội thoại gần nhất (tối đa 8 tin nhắn gần nhất để tối ưu token)
            List<ChatMessage> history = chatMessageRepository.findByChatSessionIdOrderByCreatedAtAsc(session.getId());
            // Loại bỏ tin nhắn mới nhất của user vừa lưu ở trên vì ta sẽ truyền riêng ở cuối
            if (!history.isEmpty()) {
                history = history.subList(0, history.size() - 1);
            }
            
            int startIdx = Math.max(0, history.size() - 8);
            for (int i = startIdx; i < history.size(); i++) {
                ChatMessage msg = history.get(i);
                Map<String, Object> turn = new HashMap<>();
                turn.put("role", "USER".equals(msg.getSenderType()) ? "user" : "model");
                turn.put("parts", List.of(Map.of("text", msg.getMessageText())));
                contents.add(turn);
            }

            // 3. Thêm tin nhắn mới nhất của user
            Map<String, Object> currentTurn = new HashMap<>();
            currentTurn.put("role", "user");
            currentTurn.put("parts", List.of(Map.of("text", latestUserMessage)));
            contents.add(currentTurn);

            requestBody.put("contents", contents);

            String jsonPayload = objectMapper.writeValueAsString(requestBody);
            HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode textNode = root.path("candidates").get(0).path("content").path("parts").get(0).path("text");
                if (!textNode.isMissingNode()) {
                    return textNode.asText();
                }
            }
            
            return "Xin lỗi, tôi gặp sự cố khi xử lý thông tin từ máy chủ AI. Vui lòng thử lại sau!";
        } catch (Exception e) {
            System.err.println("Error calling Gemini API: " + e.getMessage());
            return "🤖 [Hệ thống] Trợ lý AI đang bận hoặc khóa API của bạn bị giới hạn lượt gọi. Chi tiết lỗi: " + e.getMessage();
        }
    }

    /**
     * Lấy danh sách sản phẩm hoạt động để làm ngữ cảnh cho Gemini
     */
    private String getProductsContext() {
        try {
            // Khắc phục lỗi hiệu năng: chỉ lấy 25 sản phẩm active trực tiếp từ DB sử dụng Pageable
            Pageable limit = PageRequest.of(0, 25);
            List<com.example.demo.entity.Product> activeProducts = productRepository.findActiveProductsForChat(limit);

            if (activeProducts.isEmpty()) {
                return "Hiện tại cửa hàng chưa có sản phẩm nào.";
            }

            StringBuilder sb = new StringBuilder();
            sb.append("Danh sách sản phẩm đang bán tại cửa hàng PD-SHOP:\n");
            for (com.example.demo.entity.Product p : activeProducts) {
                String formattedPrice = String.format(Locale.US, "%,d", Math.round(p.getPrice())).replace(',', '.') + "đ";
                
                // Đóng gói thông tin sản phẩm thành JSON an toàn
                Map<String, Object> map = new HashMap<>();
                map.put("id", p.getId());
                map.put("name", p.getName());
                map.put("price", formattedPrice);
                map.put("thumbnail", p.getThumbnail() != null ? p.getThumbnail() : "no-image.jpg");
                
                String jsonStr = objectMapper.writeValueAsString(map);
                sb.append(String.format("- Tên: %s | Chi tiết: %s | Mô tả ngắn: %s\n",
                    p.getName(), jsonStr, p.getShortDescription() != null ? p.getShortDescription() : "Chưa có mô tả"));
            }
            return sb.toString();
        } catch (Exception e) {
            System.err.println("Error generating products context: " + e.getMessage());
            return "Không thể tải danh sách sản phẩm.";
        }
    }
}
