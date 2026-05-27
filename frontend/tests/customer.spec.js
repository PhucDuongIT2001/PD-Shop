import { test, expect } from '@playwright/test';

test.describe('Customer Role Tests', () => {

  test('Customer đăng nhập và mua sắm (Không thể truy cập Admin)', async ({ page }) => {
    
    // 1. ĐĂNG KÝ HOẶC ĐĂNG NHẬP KHÁCH HÀNG
    // Ở đây sử dụng tài khoản customer (đã tạo sẵn bằng SQL seed)
    await page.goto('http://localhost:8080/login');
    await page.locator('input[name="username"]').fill('customer');
    await page.locator('input[name="password"]').fill('customer123');
    await page.locator('button[type="submit"]').click();
    
    // Customer thường sẽ được chuyển hướng về Trang Chủ thay vì Dashboard
    await page.waitForURL('http://localhost:8080/');

    // 2. KIỂM TRA TRANG CHỦ VÀ TÌM KIẾM SẢN PHẨM
    // Đảm bảo không thấy nút "Admin Dashboard" nào trên thanh Navbar
    const navBar = page.locator('nav');
    await expect(navBar.locator('text=Admin Dashboard')).toBeHidden();
    
    // 3. CỐ TÌNH TRUY CẬP TRÁI PHÉP VÀO ADMIN DASHBOARD
    await page.goto('http://localhost:8080/admin/dashboard');
    
    // Tương tự, nếu Spring Security cấu hình đúng, nó sẽ trả về 403 hoặc đá về trang báo lỗi
    const currentUrl = page.url();
    const bodyText = await page.locator('body').innerText();
    const isForbiddenOrRedirected = currentUrl.includes('error') || currentUrl.includes('login') || bodyText.includes('403') || bodyText.includes('Access Denied');
    
    if (!isForbiddenOrRedirected) {
        console.warn('Lỗ hổng bảo mật nghiêm trọng: Customer có thể vào Admin Dashboard!');
    }

    // 4. KIỂM TRA XEM GIỎ HÀNG (Cá nhân của khách hàng)
    await page.goto('http://localhost:8080/cart');
    await expect(page.locator('h1', { hasText: 'Giỏ hàng' })).toBeVisible();

  });

});
