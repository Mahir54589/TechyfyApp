import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// Example query to get products
export const listProductsExample = query({
  args: {
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .take(args.limit);
    return {
      products: products,
    };
  },
});

// Example mutation to add a product
export const addProductExample = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    warranty: v.string(),
    category: v.string(),
    sellingPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("products", { 
      name: args.name,
      color: args.color,
      warranty: args.warranty,
      category: args.category,
      sellingPrice: args.sellingPrice,
      lastUpdated: Date.now(),
    });

    console.log("Added new product with id:", id);
    return id;
  },
});

// Example action to call external APIs
export const myAction = action({
  args: {
    first: v.number(),
    second: v.string(),
  },
  handler: async (ctx, args) => {
    // Use the browser-like `fetch` API to send HTTP requests.
    // See https://docs.convex.dev/functions/actions#calling-third-party-apis-and-using-npm-packages.
    // const response = await ctx.fetch("https://api.thirdpartyservice.com");
    // const data = await response.json();

    // Query data by running Convex queries.
    const data = await ctx.runQuery(api.myFunctions.listProductsExample, {
      limit: 10,
    });
    console.log(data);

    // Write data by running Convex mutations.
    await ctx.runMutation(api.myFunctions.addProductExample, {
      name: "Example Product",
      color: "Black",
      warranty: "1 Year",
      category: "Electronics",
      sellingPrice: 1000,
    });
  },
});
