import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all products
export const list = query({
  args: {},
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

// Add a new product
export const addProduct = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    warranty: v.string(),
    category: v.string(),
    sellingPrice: v.number(),
    lastUpdated: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("products", args);
    return id;
  },
});

// Update an existing product
export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    updates: v.object({
      name: v.optional(v.string()),
      color: v.optional(v.string()),
      warranty: v.optional(v.string()),
      category: v.optional(v.string()),
      sellingPrice: v.optional(v.number()),
      lastUpdated: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.productId, args.updates);
    return await ctx.db.get(args.productId);
  },
});