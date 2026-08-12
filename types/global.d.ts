import type { RazorpayPaymentResult } from "@/types";

declare global {
  interface RazorpayCheckoutOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill: {
      name: string;
      email: string;
    };
    handler: (response: RazorpayPaymentResult) => void;
    modal?: {
      ondismiss?: () => void;
    };
  }

  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

export {};
