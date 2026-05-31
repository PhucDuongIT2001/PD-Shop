/**
 * Trả về URL ảnh đúng cho sản phẩm.
 * - Nếu thumbnail là URL đầy đủ (http/https) → dùng thẳng
 * - Nếu là tên file cục bộ → ghép với uploads backend
 * - Nếu không có → dùng placeholder
 */
export const getProductImageUrl = (thumbnail, fallback = 'https://via.placeholder.com/400x400?text=No+Image') => {
  if (!thumbnail) return fallback;
  
  let cleanUrl = thumbnail;
  if (typeof cleanUrl === 'string' && cleanUrl.includes('localhost:8080')) {
    cleanUrl = cleanUrl.replace(/https?:\/\/localhost:8080/, '');
  }

  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }
  if (cleanUrl.startsWith('/uploads/') || cleanUrl.startsWith('uploads/')) {
    return cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  }
  return `/uploads/${cleanUrl}`;
};
