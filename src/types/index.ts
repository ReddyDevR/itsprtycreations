export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  avatarUrl?: string | null;
  isVerified: boolean;
  createdAt?: string;
}

export interface Address {
  id?: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
  displayOrder: number;
  _count?: {
    products: number;
  };
}

export interface ProductImage {
  id?: string;
  url: string;
  mediaType: 'IMAGE' | 'VIDEO';
  alt?: string | null;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductVariation {
  id?: string;
  name: string;
  value: string;
  priceAdjustment: number;
  stock: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  originalPrice: number;
  sellingPrice: number;
  discountPercent: number;
  stock: number;
  isPublished: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  categoryId: string;
  category?: Category;
  specifications?: string | null;
  details?: string | null;
  images: ProductImage[];
  variations: ProductVariation[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  variationId?: string | null;
  variation?: ProductVariation | null;
  personalization?: string | null;
}

export interface OrderItem {
  id: string;
  productId?: string | null;
  title: string;
  price: number;
  quantity: number;
  variation?: string | null;
  personalization?: string | null;
  image?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'STRIPE' | 'COD';
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  shippingAddress: string; // JSON stringified Address
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent?: number | null;
  fixedDiscount?: number | null;
  minOrderValue: number;
  maxDiscount?: number | null;
  isActive: boolean;
}
