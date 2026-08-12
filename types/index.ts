export type UserRole = "customer" | "admin";
export type ProductStatus = "active" | "draft" | "archived";
export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "expired";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price: number | null;
  category: string;
  tags: string[];
  image_url: string | null;
  file_path: string | null;
  image_urls: string[];
  file_paths: string[];
  stock_quantity: number;
  reserved_quantity: number;
  status: ProductStatus;
  metadata: ProductMetadata;
  created_at: string;
  updated_at: string;
}

export interface ProductMetadata {
  featured?: boolean;
  gallery?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  backtests?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface ProductWithStock extends Product {
  available_quantity: number;
  is_in_stock: boolean;
}

export type ProductCard = Pick<
  Product,
  "id" | "slug" | "title" | "short_description" | "price" | "compare_at_price" | "category" | "image_url" | "stock_quantity" | "reserved_quantity"
>;

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_email: string;
  customer_name: string | null;
  status: OrderStatus;
  total_amount: number;
  currency: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  expires_at: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_title: string;
  product_slug: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface Download {
  id: string;
  order_id: string;
  order_item_id: string;
  user_id: string | null;
  product_id: string | null;
  download_count: number;
  max_downloads: number;
  token: string;
  expires_at: string;
  last_downloaded_at: string | null;
  created_at: string;
}

export interface DownloadWithProduct extends Download {
  products: Pick<Product, "title" | "slug" | "image_url" | "file_path"> | null;
  order_items: Pick<OrderItem, "product_title" | "quantity"> | null;
}

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface CheckoutSession {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: "INR";
  keyId: string;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface RazorpayPaymentResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface ApiError {
  error: string;
  message?: string;
  fields?: Record<string, string[]>;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | ({ success: false } & ApiError);

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AdminDashboardStats {
  todayRevenue: number;
  todayOrders: number;
  totalOrders: number;
  totalProducts: number;
  revenueSeries: Array<{ date: string; revenue: number }>;
}
