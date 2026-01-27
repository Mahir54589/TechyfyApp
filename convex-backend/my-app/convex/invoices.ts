import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// Get invoice by number
export const getByNumber = query({
  args: {
    invoiceNumber: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invoices")
      .withIndex("by_invoiceNumber", (q) => q.eq("invoiceNumber", args.invoiceNumber))
      .first();
  },
});

// Get recent invoices
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("invoices")
      .order("desc")
      .take(limit);
  },
});

// Create a new invoice with auto-incrementing number
export const create = mutation({
  args: {
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
        amount: v.number(),
      })
    ),
    subtotal: v.number(),
    taxRate: v.number(),
    taxAmount: v.number(),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    // Get current date for invoice number generation
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    
    // Get or create invoice counter for current month
    let counter = await ctx.db
      .query("invoiceCounter")
      .withIndex("by_yearMonth", (q) => q.eq("yearMonth", yearMonth))
      .first();
    
    let currentCounter = 1;
    
    if (!counter) {
      // Create new counter for this month
      await ctx.db.insert("invoiceCounter", {
        yearMonth,
        counter: 1,
      });
    } else {
      // Increment existing counter
      currentCounter = counter.counter + 1;
      await ctx.db.patch(counter._id, {
        counter: currentCounter,
      });
    }
    
    // Generate invoice number in YYYYMM### format
    const invoiceNumber = `${yearMonth}${String(currentCounter).padStart(3, "0")}`;
    
    // Create the invoice
    const invoiceId = await ctx.db.insert("invoices", {
      invoiceNumber,
      date: now.getTime(),
      customerName: args.customerName,
      customerAddress: args.customerAddress,
      customerPhone: args.customerPhone,
      items: args.items,
      subtotal: args.subtotal,
      taxRate: args.taxRate,
      taxAmount: args.taxAmount,
      total: args.total,
    });
    
    // Return the created invoice with its ID
    return await ctx.db.get(invoiceId);
  },
});

// Generate PDF for an invoice (action to call external API)
export const generatePDF = action({
  args: {
    invoiceId: v.id("invoices"),
  },
  handler: async (ctx, args): Promise<{success: boolean, message: string, invoiceNumber?: string}> => {
    // Get the invoice data
    const invoice = await ctx.runQuery(api.invoices.get, {
      id: args.invoiceId,
    });
    
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    
    // This will be implemented later to call the PDF generation API
    // For now, return a placeholder
    return {
      success: false,
      message: "PDF generation not implemented yet",
      invoiceNumber: invoice.invoiceNumber
    };
  },
});

// Get invoice by ID (helper function for the generatePDF action)
export const get = query({
  args: {
    id: v.id("invoices"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});