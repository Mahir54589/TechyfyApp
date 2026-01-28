import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Products table - synced from Google Sheets
  products: defineTable({
    name: v.string(),
    color: v.string(),
    warranty: v.string(),
    category: v.string(),
    sellingPrice: v.number(),
    lastUpdated: v.number(),
  }).index("by_name", ["name"]),

  // Invoices table - stores all generated invoices
  invoices: defineTable({
    invoiceNumber: v.string(),
    date: v.number(),
    customerName: v.string(),
    customerAddress: v.string(),
    customerPhone: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        productName: v.string(),
        color: v.string(),
        warranty: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        discountPercent: v.optional(v.number()), // Row-level discount %
        amount: v.number(),
      })
    ),
    subtotal: v.number(),
    taxRate: v.number(), // 0.15 for 15% VAT (Bangladesh standard)
    taxAmount: v.number(),
    discountNet: v.optional(v.number()), // Flat discount amount
    deliveryCharge: v.optional(v.number()), // Delivery charge
    total: v.number(),
    pdfUrl: v.optional(v.string()),
  }).index("by_invoiceNumber", ["invoiceNumber"]).index("by_date", ["date"]),

  // Invoice counter - ensures sequential numbering
  invoiceCounter: defineTable({
    yearMonth: v.string(), // "202601"
    counter: v.number(), // 15
  }).index("by_yearMonth", ["yearMonth"]),

  // System configuration - stores settings like VAT rate
  systemConfig: defineTable({
    key: v.string(), // "vatRate", "companyInfo"
    value: v.any(), // JSON object
  }).index("by_key", ["key"]),

  // Conversation states for Telegram bot
  conversationStates: defineTable({
    userId: v.number(), // Telegram user ID
    state: v.string(), // Current conversation state
    data: v.optional(v.any()), // Additional state data
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
});
