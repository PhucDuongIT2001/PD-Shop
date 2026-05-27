import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Tests', () => {

  test('Đăng nhập và kiểm tra toàn bộ giao diện Admin Dashboard (Gộp chung để tránh dính Rate Limit Spam)', async ({ page }) => {
    
    // 1. ĐĂNG NHẬP
    await page.goto('http://localhost:8080/login');
    await page.locator('input[name="username"]').fill('admin');
    await page.locator('input[name="password"]').fill('admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('http://localhost:8080/admin/dashboard');

    // 2. KIỂM TRA TIÊU ĐỀ VÀ THẺ THỐNG KÊ
    await expect(page.locator('h1')).toContainText('Dashboard Thống Kê');
    await expect(page.locator('text=Tổng quan hệ thống cửa hàng')).toBeVisible();

    await expect(page.locator('text=Tổng Doanh Thu')).toBeVisible();
    await expect(page.locator('text=Tổng Đơn Hàng')).toBeVisible();
    await expect(page.locator('text=Tổng Sản Phẩm')).toBeVisible();
    await expect(page.locator('text=Tổng Người Dùng')).toBeVisible();

    // 3. KIỂM TRA CÁC BẢNG DỮ LIỆU
    const top5Section = page.locator('h2', { hasText: 'Top 5 Bán Chạy Nhất' });
    await expect(top5Section).toBeVisible();

    const lowStockSection = page.locator('h2', { hasText: 'Sản Phẩm Sắp Hết Hàng' });
    await expect(lowStockSection).toBeVisible();

    // 4. KIỂM TRA CHUYỂN TRANG BẰNG SIDEBAR
    const sidebar = page.locator('#sidebar-wrapper'); 
    
    await expect(sidebar.locator('a', { hasText: 'Dashboard' })).toBeVisible();
    await expect(sidebar.locator('a', { hasText: 'Products' })).toBeVisible();
    await expect(sidebar.locator('a', { hasText: 'Orders' })).toBeVisible();
    await expect(sidebar.locator('a', { hasText: 'Users' })).toBeVisible();

    // Bấm thử vào Products để xem có chuyển trang không
    await sidebar.locator('a', { hasText: 'Products' }).click();
    await page.waitForURL('http://localhost:8080/admin/products');
    
    // Đảm bảo trang Products load thành công (có chữ Add New Product)
    await expect(page.locator('text=Add New Product').or(page.locator('text=Thêm Sản Phẩm Mới'))).toBeVisible();
  });

});
