import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Define conversation states
export const ConversationState = {
  AWAITING_CUSTOMER_INFO: "awaiting_customer_info",
  AWAITING_PRODUCTS: "awaiting_products",
  AWAITING_QUANTITY: "awaiting_quantity",
  AWAITING_CONFIRMATION: "awaiting_confirmation",
} as const;

// Get conversation state for a user
export const getState = query({
  args: {
    userId: v.number(),
  },
  handler: async (ctx, args) => {
    const state = await ctx.db
      .query("conversationStates")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    return state;
  },
});

// Set conversation state
export const setState = mutation({
  args: {
    userId: v.number(),
    state: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Check if state already exists
    const existingState = await ctx.db
      .query("conversationStates")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (existingState) {
      // Update existing state
      await ctx.db.patch(existingState._id, {
        state: args.state,
        data: args.data,
        updatedAt: Date.now(),
      });
      return existingState._id;
    } else {
      // Create new state
      return await ctx.db.insert("conversationStates", {
        userId: args.userId,
        state: args.state,
        data: args.data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Clear conversation state
export const clearState = mutation({
  args: {
    userId: v.number(),
  },
  handler: async (ctx, args) => {
    const state = await ctx.db
      .query("conversationStates")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (state) {
      await ctx.db.delete(state._id);
    }
    
    return { success: true };
  },
});

// Clean up old conversation states (older than 24 hours)
export const cleanupOldStates = mutation({
  args: {},
  handler: async (ctx) => {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
    
    const oldStates = await ctx.db
      .query("conversationStates")
      .filter((q) => q.lt(q.field("updatedAt"), cutoffTime))
      .collect();
    
    for (const state of oldStates) {
      await ctx.db.delete(state._id);
    }
    
    return { deleted: oldStates.length };
  },
});
