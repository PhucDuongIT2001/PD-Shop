import { test, expect } from '@playwright/test';

test.describe('AI Chatbot UI Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Đăng nhập tài khoản khách hàng trước khi vào chat
    await page.goto('http://localhost:5174/login');
    const emailInput = page.locator('input[name="usernameOrEmail"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await emailInput.fill('customer@pdshop.com');
    await passwordInput.fill('customer123');
    await submitBtn.click();

    // Chờ chuyển hướng về trang chủ thành công
    await page.waitForURL('http://localhost:5174/');
  });

  test('Kiểm tra nút mở khung chat và gửi câu hỏi tư vấn AI', async ({ page }) => {
    // 1. Kiểm tra sự tồn tại của nút bong bóng chat ở góc màn hình
    const chatBubble = page.locator('button#chat-bubble-btn');
    await expect(chatBubble).toBeVisible();

    // 2. Click mở khung chat
    await chatBubble.click();
    
    // Khung chat bên hông (Side panel hoặc Chat Page) phải xuất hiện
    const chatContainer = page.locator('#chat-container');
    await expect(chatContainer).toBeVisible();

    // 3. Kiểm tra tiêu đề khung chat và câu chào mặc định của AI
    await expect(chatContainer.locator('text=Trợ lý ảo PD-Shop')).toBeVisible();
    await expect(chatContainer.locator('text=Tôi có thể giúp gì cho bạn?')).toBeVisible();

    // 4. Nhập câu hỏi tìm kiếm sản phẩm vào ô chat
    const chatInput = chatContainer.locator('input[placeholder*="Nhập tin nhắn"]');
    await expect(chatInput).toBeVisible();
    await chatInput.fill('Tôi muốn tìm mua bàn làm việc bằng gỗ');

    // 5. Nhấn gửi tin nhắn
    const sendBtn = chatContainer.locator('button#send-msg-btn');
    await expect(sendBtn).toBeEnabled();
    await sendBtn.click();

    // Tin nhắn của khách hàng phải hiển thị trên khung hội thoại
    await expect(chatContainer.locator('text=Tôi muốn tìm mua bàn làm việc bằng gỗ')).toBeVisible();

    // 6. Chờ AI xử lý và phản hồi (Đợi xuất hiện tin nhắn từ BOT)
    // Thiết lập timeout 10 giây để chờ kết nối và suy luận API Gemini
    const botResponse = chatContainer.locator('.bot-message-bubble').first();
    await expect(botResponse).toBeVisible({ timeout: 10000 });
    
    // Nội dung trả về từ AI không được rỗng
    const responseText = await botResponse.innerText();
    expect(responseText.length).toBeGreaterThan(0);
    
    console.log('AI Chatbot response received:', responseText);
  });

});
