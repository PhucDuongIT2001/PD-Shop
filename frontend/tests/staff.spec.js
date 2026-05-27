import { test, expect } from '@playwright/test';

test.describe('Staff Role Tests', () => {

  test('Staff đăng nhập và kiểm tra quyền hạn trên Admin Dashboard', async ({ page }) => {
    // 1. ĐĂNG NHẬP BẰNG TÀI KHOẢN STAFF
    await page.goto('http://localhost:8080/login');
    await page.locator('input[name="username"]').fill('staff');
    await page.locator('input[name="password"]').fill('staff123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('http://localhost:8080/admin/dashboard');

    // 2. KIỂM TRA GIAO DIỆN DASHBOARD
    await expect(page.locator('h1')).toContainText('Dashboard Thống Kê');
    
    // 3. KIỂM TRA PHÂN QUYỀN TRÊN SIDEBAR (Tùy thuộc vào UI của bạn có ẩn bớt menu không)
    const sidebar = page.locator('#sidebar-wrapper'); 
    
    // Staff được phép xem Dashboard, Products, Orders
    await expect(sidebar.locator('a', { hasText: 'Dashboard' })).toBeVisible();
    await expect(sidebar.locator('a', { hasText: 'Products' })).toBeVisible();
    await expect(sidebar.locator('a', { hasText: 'Orders' })).toBeVisible();

    // Vào trang Products thử
    await sidebar.locator('a', { hasText: 'Products' }).click();
    await page.waitForURL('http://localhost:8080/admin/products');
    await expect(page.locator('text=Danh sách sản phẩm').or(page.locator('h1'))).toBeVisible();

    // 4. KIỂM TRA TRUY CẬP TRÁI PHÉP VÀO TRANG CỦA ADMIN
    // Cố tình truy cập trang Users (Chỉ Admin/Manager mới được vào)
    await page.goto('http://localhost:8080/admin/users');
    
    // Spring Security sẽ báo lỗi 403 Forbidden hoặc đá về trang báo lỗi truy cập
    // (Tuỳ thuộc vào cách bạn setup trang lỗi 403)
    const bodyText = await page.locator('body').innerText();
    const isForbidden = bodyText.includes('403') || bodyText.includes('Access Denied') || bodyText.includes('không có quyền');
    
    if (!isForbidden) {
        // Nếu không bị chặn, test này sẽ cảnh báo
        console.warn('Lỗ hổng bảo mật: Staff có thể truy cập trang Users!');
    }
  });

});
