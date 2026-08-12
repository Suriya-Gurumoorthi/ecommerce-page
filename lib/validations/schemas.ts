import { z } from "zod";

export const ProductStatusSchema = z.enum(["active", "draft", "archived"]);

export const CreateProductSchema = z.object({
  slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(2).max(160),
  description: z.string().min(10),
  short_description: z.string().min(10).max(160),
  price: z.coerce.number().min(0),
  compare_at_price: z.coerce.number().min(0).nullable().optional(),
  category: z.string().min(2).max(80),
  tags: z.array(z.string().min(1)).default([]),
  image_url: z.string().url().nullable().optional(),
  file_path: z.string().min(1).nullable().optional(),
  image_urls: z.array(z.string().url()).default([]),
  file_paths: z.array(z.string().min(1)).default([]),
  stock_quantity: z.coerce.number().int().min(-1).default(-1),
  status: ProductStatusSchema.default("draft"),
  metadata: z
    .object({
      featured: z.boolean().optional(),
      gallery: z.array(z.string().url()).optional(),
      backtests: z.string().optional(),
      faqs: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional()
    })
    .default({})
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const CreateOrderSchema = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1) })).min(1),
  customerEmail: z.string().email(),
  customerName: z.string().min(1).max(120)
});

export const CheckoutSchema = CreateOrderSchema;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const RegisterSchema = z
  .object({
    fullName: z.string().min(2).max(120),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8)
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match"
  });

export const RazorpayVerifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1)
});

export const OrderNoteSchema = z.object({
  notes: z.string().max(2000)
});
