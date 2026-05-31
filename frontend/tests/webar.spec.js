import { test, expect } from '@playwright/test';

test.describe('WebAR 3D Viewer Tests', () => {

  test('Duyệt xem chi tiết sản phẩm và xác thực trình kết xuất 3D WebAR', async ({ page }) => {
    // 1. Mock các API endpoints của Backend bằng Playwright Network Interception
    await page.route('**/api/categories', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: "Smartphone" },
          { id: 2, name: "Laptop" }
        ])
      });
    });

    await page.route('**/api/brands', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: "Apple" },
          { id: 2, name: "ASUS" }
        ])
      });
    });

    await page.route('**/api/products?page=1&size=12', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: [
            {
              id: 1,
              name: "Mô hình 3D Astronaut AR",
              price: 15000000,
              thumbnail: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=400",
              image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=400",
              categoryName: "PC Gaming",
              stockQuantity: 10
            }
          ],
          totalPages: 1,
          totalElements: 1
        })
      });
    });

    await page.route('**/api/products/1', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          name: "Mô hình 3D Astronaut AR",
          price: 15000000,
          thumbnail: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=400",
          image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=400",
          categoryName: "PC Gaming",
          stockQuantity: 10,
          shortDescription: "Mô phỏng không gian vũ trụ với khả năng hiển thị 3D và tương tác AR cực kỳ mượt mà.",
          description: "<p>Mô hình phi hành gia cao cấp tích hợp trải nghiệm thực tế tăng cường AR giúp bạn tương tác trực quan.</p>",
          fullSpecifications: "Kích thước: 1m x 1m x 2m; Phong cách: Hiện đại; Hỗ trợ AR: Có"
        })
      });
    });

    await page.route('**/api/products/1/ar-asset', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          modelGlbUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
          modelUsdzUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.usdz",
          environmentMapUrl: "",
          arType: "floor",
          scaleFactor: 1.0,
          availableColors: "#ff0000, #00ff00, #0000ff",
          hotspots: [
            {
              id: 1,
              name: "helmet",
              position: "0m 1.8m 0m",
              normal: "0m 1m 0m",
              labelText: "Mũ bảo hiểm bảo vệ"
            }
          ]
        })
      });
    });

    await page.route('**/api/products/1/reviews', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reviews: [],
          averageRating: 4.8,
          totalReviews: 0
        })
      });
    });

    // 2. Bắt đầu luồng kiểm thử giao diện
    await page.goto('http://localhost:5174/products');
    
    // Đợi danh sách sản phẩm hiển thị và chụp ảnh
    const productCard = page.locator('text=Mô hình 3D Astronaut AR').first();
    await expect(productCard).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: '/Users/phucduong/.gemini/antigravity/brain/0cd59d11-b5b0-417f-8eff-fb47116a5372/product-list.png' });

    // Click vào sản phẩm đầu tiên để xem chi tiết
    await productCard.click();
    await page.waitForURL(/.*\/product\/1/);

    // Chụp ảnh chi tiết sản phẩm khi ở dạng 2D
    const arButton = page.getByRole('button', { name: 'Xem 3D / AR' });
    await expect(arButton).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: '/Users/phucduong/.gemini/antigravity/brain/0cd59d11-b5b0-417f-8eff-fb47116a5372/product-detail-2d.png' });

    // Bấm nút "Xem 3D / AR" để khởi động model-viewer
    await arButton.click();

    // Chờ model-viewer hiển thị
    const modelViewer = page.locator('model-viewer');
    await expect(modelViewer).toBeVisible({ timeout: 5000 });
    await expect(modelViewer).toHaveAttribute('ar');

    // Đợi 8 giây cho mô hình 3D tải hoàn tất
    await page.waitForTimeout(8000);

    // 1. Chụp ảnh toàn bộ trang chi tiết sản phẩm (từ đầu đến cuối)
    await page.screenshot({ path: '/Users/phucduong/.gemini/antigravity/brain/0cd59d11-b5b0-417f-8eff-fb47116a5372/product-detail-full.png', fullPage: true });
    
    // 2. Chụp riêng khung hiển thị 3D model-viewer
    await modelViewer.screenshot({ path: '/Users/phucduong/.gemini/antigravity/brain/0cd59d11-b5b0-417f-8eff-fb47116a5372/model-viewer-only.png' });
    
    console.log("Đã chụp thành công các ảnh: product-list.png, product-detail-2d.png, product-detail-full.png, model-viewer-only.png");
  });

});
