import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get sample products for initialization
export const getSampleProducts = query({
  args: {},
  handler: async () => {
    return [
      {
        name: "iPhone 15 Pro",
        color: "Space Black",
        warranty: "1 Year",
        category: "Smartphones",
        sellingPrice: 129900,
      },
      {
        name: "AirPods Pro (2nd Gen)",
        color: "White",
        warranty: "1 Year",
        category: "Audio",
        sellingPrice: 24900,
      },
      {
        name: "Samsung Galaxy S24 Ultra",
        color: "Titanium Black",
        warranty: "1 Year",
        category: "Smartphones",
        sellingPrice: 145000,
      },
      {
        name: "MacBook Air M3",
        color: "Midnight",
        warranty: "1 Year",
        category: "Laptops",
        sellingPrice: 175000,
      },
      {
        name: "iPad Pro 12.9",
        color: "Space Gray",
        warranty: "1 Year",
        category: "Tablets",
        sellingPrice: 95000,
      },
    ];
  },
});

// Add a sample product (used by initialization script)
export const addProductExample = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    warranty: v.string(),
    category: v.string(),
    sellingPrice: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if product already exists
    const existing = await ctx.db
      .query("products")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      // Update existing product
      await ctx.db.patch(existing._id, {
        ...args,
        lastUpdated: Date.now(),
      });
      return existing._id;
    }

    // Insert new product
    const id = await ctx.db.insert("products", {
      ...args,
      lastUpdated: Date.now(),
    });

    return id;
  },
});
