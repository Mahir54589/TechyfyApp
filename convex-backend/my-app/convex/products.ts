import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all products
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

// Search products by name (fuzzy search)
export const search = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const { query } = args;
    
    // Get all products
    const allProducts = await ctx.db.query("products").collect();
    
    // If query is empty, return all products
    if (!query.trim()) {
      return allProducts;
    }
    
    // Perform fuzzy search
    const lowerQuery = query.toLowerCase();
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery) ||
      product.color.toLowerCase().includes(lowerQuery)
    );
  },
});

// Sync products from Google Sheets
export const syncFromGoogleSheets = mutation({
  handler: async (ctx) => {
    // This will be implemented later with Google Sheets API
    // For now, return a placeholder
    return { success: false, message: "Google Sheets integration not implemented yet" };
  },
});