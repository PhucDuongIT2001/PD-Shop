/**
 * Trả về URL ảnh đúng cho sản phẩm.
 * - Nếu thumbnail là URL đầy đủ (http/https) → dùng thẳng
 * - Nếu là tên file cục bộ → ghép với uploads backend
 * - Nếu không có → dùng placeholder
 */
export const getProductImageUrl = (thumbnail, fallback = 'https://via.placeholder.com/400x400?text=No+Image') => {
  if (!thumbnail) return fallback;
  if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) {
    return thumbnail;
  }
  return `/uploads/${thumbnail}`;
};
