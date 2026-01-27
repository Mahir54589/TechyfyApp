import { v } from "convex/values";
import { query, action } from "./_generated/server";
import { api } from "./_generated/api";

// Google Sheets configuration from environment variables
const GOOGLE_SHEETS_CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const GOOGLE_SHEETS_PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

// Interface for product data from Google Sheets
interface GoogleSheetProduct {
  name: string;
  color: string;
  warranty: string;
  category: string;
  sellingPrice: number;
}

// Get sync status
export const getSyncStatus = query({
  args: {},
  handler: async (ctx) => {
    const lastSync = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", "lastProductSync"))
      .first();

    return {
      lastSync: lastSync?.value?.timestamp || null,
      productsCount: await ctx.db.query("products").collect().then((p) => p.length),
    };
  },
});

// Sync products from Google Sheets (action to use fetch API)
export const syncFromGoogleSheets = action({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    productsAdded: v.number(),
    productsUpdated: v.number(),
    errors: v.optional(v.array(v.string())),
  }),
  handler: async (ctx) => {
    // Check environment variables
    if (!GOOGLE_SHEETS_CLIENT_EMAIL || !GOOGLE_SHEETS_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
      return {
        success: false,
        message: "Google Sheets credentials not configured. Please set environment variables.",
        productsAdded: 0,
        productsUpdated: 0,
        errors: ["Missing GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, or GOOGLE_SHEET_ID"],
      };
    }

    try {
      // Get OAuth token using JWT
      const token = await getGoogleAccessToken();

      // Fetch data from Google Sheets
      const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Sheet1!A2:E`;
      
      const response = await fetch(sheetUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Google Sheets API error: ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      const rows = data.values || [];

      if (rows.length === 0) {
        return {
          success: true,
          message: "No data found in Google Sheet",
          productsAdded: 0,
          productsUpdated: 0,
        };
      }

      // Process rows into product objects
      const products: GoogleSheetProduct[] = [];
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        // Skip empty rows
        if (!row[0]) continue;

        // Validate required fields
        if (!row[0] || row[4] === undefined || row[4] === null) {
          errors.push(`Row ${i + 2}: Missing required fields (name or price)`);
          continue;
        }

        const price = parseFloat(row[4]);
        if (isNaN(price) || price < 0) {
          errors.push(`Row ${i + 2}: Invalid price "${row[4]}"`);
          continue;
        }

        products.push({
          name: row[0]?.trim() || "",
          color: row[1]?.trim() || "",
          warranty: row[2]?.trim() || "",
          category: row[3]?.trim() || "",
          sellingPrice: price,
        });
      }

      // Get existing products for comparison
      const existingProducts = await ctx.runQuery(api.products.list);
      const existingMap = new Map(existingProducts.map((p) => [p.name.toLowerCase(), p]));

      let productsAdded = 0;
      let productsUpdated = 0;

      // Insert or update products
      for (const product of products) {
        const existing = existingMap.get(product.name.toLowerCase());

        if (existing) {
          // Update if price or other fields changed
          const needsUpdate =
            existing.sellingPrice !== product.sellingPrice ||
            existing.color !== product.color ||
            existing.warranty !== product.warranty ||
            existing.category !== product.category;

          if (needsUpdate) {
            await ctx.runMutation(api.products.updateProduct, {
              productId: existing._id,
              updates: {
                ...product,
                lastUpdated: Date.now(),
              },
            });
            productsUpdated++;
          }
        } else {
          // Insert new product
          await ctx.runMutation(api.products.addProduct, {
            ...product,
            lastUpdated: Date.now(),
          });
          productsAdded++;
        }
      }

      // Update last sync timestamp
      await ctx.runMutation(api.config.set, {
        key: "lastProductSync",
        value: {
          timestamp: Date.now(),
          productsAdded,
          productsUpdated,
          totalProducts: products.length,
        },
      });

      return {
        success: true,
        message: `Sync completed successfully`,
        productsAdded,
        productsUpdated,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error("Google Sheets sync error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error during sync",
        productsAdded: 0,
        productsUpdated: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  },
});

// Helper function to get Google OAuth access token
async function getGoogleAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600; // 1 hour

  // Create JWT claims
  const claims = {
    iss: GOOGLE_SHEETS_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: expiry,
    iat: now,
  };

  // Base64 encode
  const encodeBase64 = (str: string): string => {
    return btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  };

  const header = encodeBase64(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = encodeBase64(JSON.stringify(claims));
  const signingInput = `${header}.${payload}`;

  // Sign with private key (using Web Crypto API)
  const privateKey = GOOGLE_SHEETS_PRIVATE_KEY!;
  
  // Import the private key
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKey),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  // Sign the JWT
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const jwt = `${signingInput}.${encodeBase64(
    String.fromCharCode(...new Uint8Array(signature))
  )}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json();
    throw new Error(
      `Token exchange failed: ${errorData.error_description || tokenResponse.statusText}`
    );
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// Helper to convert PEM private key to ArrayBuffer
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  
  const binaryString = atob(b64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper function for base64 decoding (for atob)
function atob(str: string): string {
  return Buffer.from(str, "base64").toString("binary");
}

function btoa(str: string): string {
  return Buffer.from(str, "binary").toString("base64");
}
