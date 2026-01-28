import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// PDF Generation API URL (Vercel deployment)
const PDF_API_URL = process.env.PDF_API_URL || "http://localhost:3000/api/generate-invoice-pdf";

// Invoice type
type Invoice = {
  _id: string;
  invoiceNumber: string;
  date: number;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    productName: string;
    color: string;
    warranty: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  pdfUrl?: string;
};

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

// Create a new invoice with auto-incrementing number (atomic)
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
    
    // Try to get existing counter with atomic check
    const counter = await ctx.db
      .query("invoiceCounter")
      .withIndex("by_yearMonth", (q) => q.eq("yearMonth", yearMonth))
      .first();
    
    let currentCounter: number;
    
    if (!counter) {
      // Create new counter for this month - use unique constraint via yearMonth
      currentCounter = 1;
      try {
        await ctx.db.insert("invoiceCounter", {
          yearMonth,
          counter: currentCounter,
        });
      } catch {
        // If insert fails (race condition), another request created it
        // Re-fetch and increment
        const existingCounter = await ctx.db
          .query("invoiceCounter")
          .withIndex("by_yearMonth", (q) => q.eq("yearMonth", yearMonth))
          .first();
        
        if (!existingCounter) {
          throw new Error("Failed to create or fetch invoice counter");
        }
        
        currentCounter = existingCounter.counter + 1;
        await ctx.db.patch(existingCounter._id, {
          counter: currentCounter,
        });
      }
    } else {
      // Increment existing counter
      currentCounter = counter.counter + 1;
      await ctx.db.patch(counter._id, {
        counter: currentCounter,
      });
    }
    
    // Generate invoice number in YYYYMM### format
    const invoiceNumber = `${yearMonth}${String(currentCounter).padStart(3, "0")}`;
    
    // Verify no duplicate invoice number exists
    const existingInvoice = await ctx.db
      .query("invoices")
      .withIndex("by_invoiceNumber", (q) => q.eq("invoiceNumber", invoiceNumber))
      .first();
    
    if (existingInvoice) {
      throw new Error(`Invoice number ${invoiceNumber} already exists. Please retry.`);
    }
    
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
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    invoiceNumber: v.optional(v.string()),
    pdfBase64: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<{success: boolean; message: string; invoiceNumber?: string; pdfBase64?: string}> => {
    // Get the invoice data
    const invoice: Invoice | null = await ctx.runQuery(api.invoices.get, {
      id: args.invoiceId,
    });
    
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    
    try {
      // Transform items to new format for InvoiceDocument
      const transformedItems = invoice.items.map((item, index) => ({
        slNo: index + 1,
        itemName: item.productName,
        quantity: item.quantity,
        rate: item.unitPrice,
        discountRow: 0, // Default discount per row (can be extended later)
        amount: item.amount,
      }));
      
      // Calculate totals (for now, no discount, no delivery charge)
      const netTotal = invoice.subtotal;
      const discountNet = 0;
      const deliveryCharge = 0;
      const grandTotal = invoice.total;
      
      // Format date as DD-MM-YYYY
      const date = new Date(invoice.date);
      const formattedDate = `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
      
      // Call the PDF generation API using global fetch
      const response = await fetch(PDF_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          date: formattedDate,
          customerName: invoice.customerName,
          customerAddress: invoice.customerAddress,
          customerPhone: invoice.customerPhone,
          items: transformedItems,
          netTotal,
          discountNet,
          deliveryCharge,
          grandTotal,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PDF API error: ${response.status} - ${errorText}`);
      }
      
      // Get PDF as buffer and convert to base64 (Web compatible)
      const pdfBuffer = await response.arrayBuffer();
      const pdfBytes = new Uint8Array(pdfBuffer);
      let pdfBase64 = "";
      for (let i = 0; i < pdfBytes.length; i++) {
        pdfBase64 += String.fromCharCode(pdfBytes[i]);
      }
      pdfBase64 = btoa(pdfBase64);
      
      // Update invoice with PDF URL placeholder (could store actual URL if uploaded)
      await ctx.runMutation(api.invoices.updatePdfUrl, {
        invoiceId: args.invoiceId,
        pdfUrl: `data:application/pdf;base64,${pdfBase64.substring(0, 50)}...`, // Store reference
      });
      
      return {
        success: true,
        message: "PDF generated successfully",
        invoiceNumber: invoice.invoiceNumber,
        pdfBase64: pdfBase64,
      };
    } catch (error) {
      console.error("PDF generation error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error during PDF generation",
        invoiceNumber: invoice.invoiceNumber,
      };
    }
  },
});

// Update PDF URL for an invoice
export const updatePdfUrl = mutation({
  args: {
    invoiceId: v.id("invoices"),
    pdfUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invoiceId, {
      pdfUrl: args.pdfUrl,
    });
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

// Helper function for base64 encoding (Web compatible)
function btoa(str: string): string {
  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(str);
  }
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  for (let block = 0, charCode, idx = 0, map = chars; str.charAt(idx | 0) || (map = "=", idx % 1); output += map.charAt(63 & block >> 8 - idx % 1 * 8)) {
    charCode = str.charCodeAt(idx += 3 / 4);
    block = block << 8 | charCode;
  }
  return output;
}