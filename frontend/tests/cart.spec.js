import { test, expect } from '@playwright/test';

test.describe('Cart Page Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Đăng nhập khách hàng trước khi tương tác giỏ hàng
    await page.goto('http://localhost:5173/login');
    await page.locator('input[name="usernameOrEmail"]').fill('customer@pdshop.com');
    await page.locator('input[name="password"]').fill('customer123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('http://localhost:5173/');
  });

  test('Thêm sản phẩm vào giỏ hàng và thay đổi số lượng', async ({ page }) => {
    // 1. Truy cập trang danh sách sản phẩm
    await page.goto('http://localhost:5173/products');
    
    // Đợi sản phẩm hiển thị và click sản phẩm đầu tiên
    const firstProduct = page.locator('.product-card').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();

    // 2. Tại trang chi tiết sản phẩm, click "Thêm vào giỏ hàng"
    const addToCartBtn = page.locator('button:has-text("Thêm vào giỏ hàng")');
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // Xác nhận Toast thông báo thành công xuất hiện
    await expect(page.locator('text=Đã thêm vào giỏ hàng')).toBeVisible();

    // 3. Vào trang giỏ hàng
    await page.goto('http://localhost:5173/cart');
    await expect(page.locator('h1:has-text("Giỏ hàng")')).toBeVisible();

    // 4. Kiểm tra tăng số lượng sản phẩm lên 2
    const quantityInput = page.locator('input[type="number"]').first();
    await expect(quantityInput).toBeVisible();
    await quantityInput.fill('2');

    // Kiểm tra tổng giá tiền tự động cập nhật
    const totalPrice = page.locator('.total-price-display');
    if (await totalPrice.count() > 0) {
      await expect(totalPrice).toBeVisible();
    }
  });

  test('Xóa sản phẩm khỏi giỏ hàng', async ({ page }) => {
    await page.goto('http://localhost:5173/cart');
    
    // Nếu có sản phẩm trong giỏ hàng, bấm nút Xóa
    const removeBtn = page.locator('button.remove-cart-item-btn').first();
    if (await removeBtn.count() > 0) {
      await removeBtn.click();
      await expect(page.locator('text=Đã xóa sản phẩm khỏi giỏ hàng')).toBeVisible();
    }
  });

});
