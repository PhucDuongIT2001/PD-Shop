import { test, expect } from '@playwright/test';

test.describe('Login Page Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Truy cập vào trang đăng nhập của React App
    await page.goto('http://localhost:5174/login');
  });

  test('Giao diện hiển thị đúng tiêu đề và các trường nhập liệu', async ({ page }) => {
    // Kiểm tra tiêu đề chính
    await expect(page.locator('h2')).toContainText('Chào mừng');
    await expect(page.locator('h3')).toContainText('Đăng Nhập', { ignoreCase: true });

    // Kiểm tra ô nhập Email/Tài khoản hiển thị
    const emailInput = page.locator('input[name="usernameOrEmail"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', 'name@company.com');

    // Kiểm tra ô nhập Mật khẩu hiển thị
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Nút đăng nhập phải ở trạng thái disabled khi chưa nhập dữ liệu
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeDisabled();
  });

  test('Báo lỗi Validation nếu người dùng bỏ trống dữ liệu', async ({ page }) => {
    const emailInput = page.locator('input[name="usernameOrEmail"]');
    const passwordInput = page.locator('input[name="password"]');

    // Click vào ô email rồi click ra ngoài (để kích hoạt lỗi validation của react-hook-form)
    await emailInput.focus();
    await passwordInput.focus();
    await page.locator('body').click();

    // Do mode='onChange', lỗi chỉ xuất hiện khi có sự thay đổi.
    // Thử gõ 1 ký tự rồi xóa đi để ép form báo lỗi.
    await emailInput.fill('a');
    await emailInput.fill('');
    
    await expect(page.locator('text=Vui lòng nhập Email hoặc Username')).toBeVisible();
  });

  test('Trạng thái nút Đăng nhập thay đổi khi nhập đủ dữ liệu hợp lệ', async ({ page }) => {
    const emailInput = page.locator('input[name="usernameOrEmail"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    // Nhập dữ liệu hợp lệ
    await emailInput.fill('admin');
    await passwordInput.fill('admin123');

    // Nút đăng nhập phải được kích hoạt (enabled)
    await expect(submitBtn).toBeEnabled();
  });

  test('Tính năng Ẩn/Hiện mật khẩu hoạt động tốt', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    
    // Nút bật tắt mắt (chứa icon Eye/EyeOff) là thẻ button nằm ngay sau thẻ input
    const toggleBtn = page.locator('input[name="password"] + button');

    await passwordInput.fill('secret123');
    
    // Ban đầu là type="password"
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Bấm nút để hiện mật khẩu
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Bấm lại để ẩn
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

});
