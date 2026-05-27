export const categories = [
  { id: 1, name: "Smartphone", icon: "Smartphone", gradient: "from-blue-600/20 to-cyan-500/10" },
  { id: 2, name: "Laptop", icon: "Laptop", gradient: "from-purple-600/20 to-pink-500/10" },
  { id: 3, name: "PC Gaming", icon: "Monitor", gradient: "from-red-600/20 to-orange-500/10" },
  { id: 4, name: "Smartwatch", icon: "Watch", gradient: "from-green-600/20 to-emerald-500/10" },
  { id: 5, name: "Accessories", icon: "Headphones", gradient: "from-yellow-600/20 to-amber-500/10" },
];

export const products = [
  {
    id: 1,
    name: "iPhone 15 Pro Max 256GB Titanium",
    price: 34990000,
    oldPrice: 36990000,
    discount: 5,
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=400",
    category: "Smartphone",
    status: "HOT",
    arAsset: {
      modelGlbUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
      environmentMapUrl: "https://modelviewer.dev/shared-assets/environments/spruit_sunrise_1k_HDR.hdr",
      availableColors: "#FFFFFF,#000000,#FF0000,#0000FF",
      hotspots: [
        { id: 1, name: "visor", position: "0 1.6 0.3", normal: "0 0 1", labelText: "Kính bảo hộ chống tia UV" },
        { id: 2, name: "backpack", position: "0 1.2 -0.3", normal: "0 0 -1", labelText: "Balo cung cấp Oxy" }
      ]
    }
  },
  {
    id: 2,
    name: "ASUS ROG Zephyrus G14 (2024)",
    price: 45990000,
    oldPrice: 48990000,
    discount: 6,
    rating: 4.9,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1629757509637-7c99379d6d26?auto=format&fit=crop&q=80&w=400",
    category: "Laptop",
    status: "NEW",
  },
  {
    id: 3,
    name: "Mechanical Keyboard RGB Wireless",
    price: 2500000,
    oldPrice: 2900000,
    discount: 14,
    rating: 4.7,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=400",
    category: "Accessories",
    status: "SALE",
  },
  {
    id: 4,
    name: "Gaming Mouse Wireless Pro",
    price: 1800000,
    oldPrice: 2200000,
    discount: 18,
    rating: 4.6,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=400",
    category: "Accessories",
    status: "BEST",
  },
  {
    id: 5,
    name: "MacBook Air M3 2024 Space Gray",
    price: 27990000,
    oldPrice: 29990000,
    discount: 7,
    rating: 4.9,
    reviews: 42,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400",
    category: "Laptop",
    status: "NEW",
  },
  {
    id: 6,
    name: "Sony WH-1000XM5 Noise Canceling",
    price: 8490000,
    oldPrice: 9490000,
    discount: 11,
    rating: 4.8,
    reviews: 320,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400",
    category: "Accessories",
    status: "HOT",
  }
];

export const mockOrders = [
  {
    id: "ORD-24001",
    customerName: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    date: "2024-05-15T10:30:00",
    total: 34990000,
    status: "DELIVERED",
    paymentMethod: "COD",
    items: 1
  },
  {
    id: "ORD-24002",
    customerName: "Trần Thị B",
    email: "tranthib@gmail.com",
    date: "2024-05-15T14:45:00",
    total: 45990000,
    status: "PROCESSING",
    paymentMethod: "CREDIT_CARD",
    items: 2
  },
  {
    id: "ORD-24003",
    customerName: "Lê Văn C",
    email: "levanc@gmail.com",
    date: "2024-05-14T09:15:00",
    total: 4300000,
    status: "SHIPPING",
    paymentMethod: "VNPAY",
    items: 3
  },
  {
    id: "ORD-24004",
    customerName: "Phạm Thị D",
    email: "phamthid@gmail.com",
    date: "2024-05-13T16:20:00",
    total: 8490000,
    status: "CANCELLED",
    paymentMethod: "COD",
    items: 1
  }
];

export const mockCustomers = [
  {
    id: 1,
    username: "nguyenvana",
    email: "nguyenvana@gmail.com",
    fullName: "Nguyễn Văn A",
    phone: "0901234567",
    enabled: true,
    createdAt: "2024-01-15T10:30:00",
    orderCount: 5,
    totalSpent: 85000000,
  },
  {
    id: 2,
    username: "tranthib",
    email: "tranthib@gmail.com",
    fullName: "Trần Thị B",
    phone: "0912345678",
    enabled: true,
    createdAt: "2024-02-20T14:45:00",
    orderCount: 2,
    totalSpent: 45990000,
  },
  {
    id: 3,
    username: "levanc",
    email: "levanc@gmail.com",
    fullName: "Lê Văn C",
    phone: "0923456789",
    enabled: false,
    createdAt: "2024-03-10T09:15:00",
    orderCount: 0,
    totalSpent: 0,
  },
  {
    id: 4,
    username: "phamthid",
    email: "phamthid@gmail.com",
    fullName: "Phạm Thị D",
    phone: "0934567890",
    enabled: true,
    createdAt: "2024-04-05T16:20:00",
    orderCount: 8,
    totalSpent: 120500000,
  }
];
