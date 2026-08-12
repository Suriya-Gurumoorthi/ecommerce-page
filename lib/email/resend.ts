import * as Sentry from "@sentry/nextjs";
import React from "react";
import { Resend } from "resend";
import { render } from "@react-email/components";
import type { AdminDashboardStats, Order, OrderItem, Product } from "@/types";
import { appUrl } from "@/lib/utils";
import { OrderConfirmationEmail } from "@/emails/OrderConfirmation";
import { PaymentFailedEmail } from "@/emails/PaymentFailed";
import { NewOrderMerchantEmail } from "@/emails/NewOrderMerchant";
import { LowStockAlertEmail } from "@/emails/LowStockAlert";
import { DailySummaryEmail } from "@/emails/DailySummary";

let resendClient: Resend | undefined;

export function createResendClient() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
}

async function sendEmail(to: string, subject: string, react: React.ReactElement, text: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return;
    }

    await createResendClient().emails.send({
      from: process.env.EMAIL_FROM ?? "noreply@example.com",
      to,
      subject,
      html: await render(react),
      text
    });
  } catch (error) {
    Sentry.captureException(error);
  }
}

export function sendOrderConfirmation(order: Order, items: OrderItem[], downloadUrl = appUrl("/downloads")) {
  void sendEmail(
    order.customer_email,
    `Your order #${order.order_number} is confirmed`,
    React.createElement(OrderConfirmationEmail, { order, items, downloadUrl }),
    `Your order ${order.order_number} is confirmed. Download your purchases at ${downloadUrl}.`
  );
}

export function sendPaymentFailed(order: Order) {
  void sendEmail(
    order.customer_email,
    `Payment failed for order #${order.order_number}`,
    React.createElement(PaymentFailedEmail, { order, retryUrl: appUrl("/cart") }),
    `Payment failed for order ${order.order_number}. Retry at ${appUrl("/cart")}.`
  );
}

export function sendNewOrderNotification(order: Order, items: OrderItem[]) {
  const merchantEmail = process.env.MERCHANT_EMAIL;

  if (!merchantEmail) {
    return;
  }

  void sendEmail(
    merchantEmail,
    `New order #${order.order_number} — ₹${order.total_amount}`,
    React.createElement(NewOrderMerchantEmail, { order, items, adminUrl: appUrl(`/admin/orders/${order.id}`) }),
    `New order ${order.order_number} for ₹${order.total_amount}.`
  );
}

export function sendLowStockAlert(product: Product) {
  const merchantEmail = process.env.MERCHANT_EMAIL;

  if (!merchantEmail) {
    return;
  }

  void sendEmail(
    merchantEmail,
    `Low stock alert — ${product.title}`,
    React.createElement(LowStockAlertEmail, { product, adminUrl: appUrl(`/admin/products/${product.id}`) }),
    `${product.title} has low stock.`
  );
}

export function sendDailySummary(stats: AdminDashboardStats) {
  const merchantEmail = process.env.MERCHANT_EMAIL;

  if (!merchantEmail) {
    return;
  }

  void sendEmail(
    merchantEmail,
    `Daily sales summary — ${new Date().toLocaleDateString("en-IN")}`,
    React.createElement(DailySummaryEmail, { stats, adminUrl: appUrl("/admin") }),
    `Daily sales summary: ${stats.todayOrders} orders and ₹${stats.todayRevenue} revenue.`
  );
}
