import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";

// Get system configuration by key
export const get = query({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    
    return config?.value;
  },
});

// Set system configuration
export const set = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    // Check if config already exists
    const existingConfig = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    
    if (existingConfig) {
      // Update existing config
      await ctx.db.patch(existingConfig._id, {
        value: args.value,
      });
      return await ctx.db.get(existingConfig._id);
    } else {
      // Create new config
      const configId = await ctx.db.insert("systemConfig", {
        key: args.key,
        value: args.value,
      });
      return await ctx.db.get(configId);
    }
  },
});

// Initialize default configuration
export const initializeDefaults = mutation({
  handler: async (ctx) => {
    // Set default VAT rate (15% for Bangladesh)
    await ctx.db.insert("systemConfig", {
      key: "vatRate",
      value: {
        rate: 0.15,
        label: "VAT (15%)",
      },
    });
    
    // Set default currency
    await ctx.db.insert("systemConfig", {
      key: "currency",
      value: {
        symbol: "৳",
        code: "BDT",
        name: "Bangladeshi Taka",
      },
    });
    
    return { success: true, message: "Default configuration initialized" };
  },
});