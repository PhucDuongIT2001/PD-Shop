import { test, expect } from '@playwright/test';

test.describe('WebAR 3D Viewer Tests', () => {

  test('Duyệt xem chi tiết sản phẩm và xác thực trình kết xuất 3D WebAR', async ({ page }) => {
    // 1. Truy cập vào trang danh sách sản phẩm
    await page.goto('http://localhost:5173/products');
    
    // Đợi danh sách sản phẩm được tải và hiển thị
    const productCard = page.locator('.product-card').first();
    await expect(productCard).toBeVisible();

    // 2. Click chọn sản phẩm đầu tiên để xem chi tiết
    await productCard.click();
    
    // Đảm bảo URL chuyển hướng đến trang chi tiết thành công (matching dạng /product/:id)
    await page.waitForURL(/.*\/product\/\d+/);

    // 3. Xác thực hiển thị khung kết xuất 3D model-viewer
    const modelViewer = page.locator('model-viewer');
    
    // Nếu sản phẩm đó có hỗ trợ 3D Asset
    if (await modelViewer.count() > 0) {
      await expect(modelViewer).toBeVisible();

      // Kiểm tra thuộc tính bắt buộc của model-viewer để chạy WebAR
      await expect(modelViewer).toHaveAttribute('ar');
      await expect(modelViewer).toHaveAttribute('camera-controls');

      // 4. Kiểm tra sự tồn tại của nút "Xem AR" (View in AR button) tích hợp
      const arButton = modelViewer.locator('button[slot="ar-button"]');
      await expect(arButton).toBeVisible();

      // 5. Kiểm tra hiển thị các điểm ghim chú thích (AR Hotspots) trên sản phẩm
      const hotspots = modelViewer.locator('button[slot^="hotspot-"]');
      const count = await hotspots.count();
      console.log(`Tìm thấy ${count} điểm ghim chú thích (Hotspots) trên mô hình 3D.`);
      
      if (count > 0) {
        await expect(hotspots.first()).toBeVisible();
      }
    } else {
      console.log('Sản phẩm hiện tại không hỗ trợ hiển thị mô hình 3D WebAR.');
    }
  });

});
