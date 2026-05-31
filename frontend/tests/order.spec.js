import { test, expect } from '@playwright/test';

test.describe('Order Checkout Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Đăng nhập khách hàng trước khi đặt hàng
    await page.goto('http://localhost:5173/login');
    await page.locator('input[name="usernameOrEmail"]').fill('customer@pdshop.com');
    await page.locator('input[name="password"]').fill('customer123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('http://localhost:5173/');
  });

  test('Thực hiện quy trình đặt hàng thành công qua COD', async ({ page }) => {
    // 1. Vào giỏ hàng
    await page.goto('http://localhost:5173/cart');
    
    // Nếu giỏ hàng trống, quay lại thêm sản phẩm
    const checkoutBtn = page.locator('button:has-text("Thanh toán")');
    if (await checkoutBtn.isDisabled()) {
      await page.goto('http://localhost:5173/products');
      await page.locator('.product-card').first().click();
      await page.locator('button:has-text("Thêm vào giỏ hàng")').click();
      await page.goto('http://localhost:5173/cart');
    }

    // 2. Click nút Thanh toán chuyển sang trang Checkout
    await checkoutBtn.click();
    await page.waitForURL(/.*\/checkout/);

    // 3. Nhập thông tin giao hàng
    await page.locator('input[name="fullName"]').fill('Nguyễn Văn Khách');
    await page.locator('input[name="phone"]').fill('0987654321');
    await page.locator('input[name="shippingAddress"]').fill('123 Đường Cách Mạng Tháng Tám, Quận 1, TP. Hồ Chí Minh');

    // 4. Chọn hình thức thanh toán COD (mặc định hoặc click chọn)
    const codRadio = page.locator('input[value="COD"]');
    if (await codRadio.count() > 0) {
      await codRadio.click();
    }

    // 5. Bấm nút Xác nhận đặt hàng
    const orderBtn = page.locator('button:has-text("Đặt hàng")');
    await expect(orderBtn).toBeVisible();
    await orderBtn.click();

    // Chờ hệ thống xử lý chuyển hướng đến trang thông báo đặt hàng thành công
    await page.waitForURL(/.*\/order\/success/);
    await expect(page.locator('text=Đặt hàng thành công')).toBeVisible();
  });

});
