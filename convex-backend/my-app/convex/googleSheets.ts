import { v } from "convex/values";
import { query, action } from "./_generated/server";
import { api } from "./_generated/api";

// Helper to get env vars inside handler (Convex requirement)
function getGoogleSheetsConfig() {
  const GOOGLE_SHEETS_CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  // Handle both actual newlines and \n escape sequences
  const GOOGLE_SHEETS_PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY
    ?.replace(/\\n/g, "\n")  // Convert \n to actual newlines
    ?.replace(/\r\n/g, "\n"); // Normalize Windows line endings
  const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
  
  return { GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEET_ID };
}

// Interface for product data from Google Sheets
interface GoogleSheetProduct {
  name: string;
  color: string;
  warranty: string;
  category: string;
  sellingPrice: number;
}

// Debug: Check environment variables
export const debugEnvVars = query({
  args: {},
  handler: async (ctx) => {
    const config = getGoogleSheetsConfig();
    return {
      hasClientEmail: !!config.GOOGLE_SHEETS_CLIENT_EMAIL,
      hasPrivateKey: !!config.GOOGLE_SHEETS_PRIVATE_KEY,
      hasSheetId: !!config.GOOGLE_SHEET_ID,
      clientEmailLength: config.GOOGLE_SHEETS_CLIENT_EMAIL?.length || 0,
      privateKeyLength: config.GOOGLE_SHEETS_PRIVATE_KEY?.length || 0,
      sheetIdLength: config.GOOGLE_SHEET_ID?.length || 0,
      clientEmailPreview: config.GOOGLE_SHEETS_CLIENT_EMAIL?.substring(0, 20) || null,
      sheetIdPreview: config.GOOGLE_SHEET_ID?.substring(0, 20) || null,
    };
  },
});

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
    // Get environment variables inside handler (Convex requirement)
    const { GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEET_ID } = getGoogleSheetsConfig();
    
    // Check environment variables
    if (!GOOGLE_SHEETS_CLIENT_EMAIL || !GOOGLE_SHEETS_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
      console.error("Missing env vars:", { 
        hasClientEmail: !!GOOGLE_SHEETS_CLIENT_EMAIL, 
        hasPrivateKey: !!GOOGLE_SHEETS_PRIVATE_KEY, 
        hasSheetId: !!GOOGLE_SHEET_ID 
      });
      return {
        success: false,
        message: "Google Sheets credentials not configured. Please set environment variables.",
        productsAdded: 0,
        productsUpdated: 0,
        errors: ["Missing GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, or GOOGLE_SHEET_ID"],
      };
    }

    try {
      // Fetch data from Google Sheets
      // Sheet format: A=Model, B=Selling Price, C=Warranty, D=Color, E=Type
      // Tab name: ProductsDatabase, Data starts from row 2
      const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/ProductsDatabase!A2:E`;
      
      // Get OAuth token
      const token = await getGoogleAccessToken(GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY);
      
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
      
      console.log("Sheet data received:", { rowCount: rows.length, firstFewRows: rows.slice(0, 3) });

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
        
        console.log(`Processing row ${i + 2}:`, row);
        
        // Skip empty rows
        if (!row[0]) {
          console.log(`Row ${i + 2}: Skipping - empty model`);
          continue;
        }

        // Validate required fields (Model and Selling Price)
        if (!row[0] || row[1] === undefined || row[1] === null) {
          errors.push(`Row ${i + 2}: Missing required fields (model or selling price)`);
          console.log(`Row ${i + 2}: Skipping - missing model or price`);
          continue;
        }

        const price = parseFloat(row[1]);
        if (isNaN(price) || price < 0) {
          errors.push(`Row ${i + 2}: Invalid price "${row[1]}"`);
          console.log(`Row ${i + 2}: Skipping - invalid price "${row[1]}"`);
          continue;
        }

        // Sheet format: A=Model, B=Selling Price, C=Warranty, D=Color, E=Type
        products.push({
          name: row[0]?.trim() || "",           // Model → name
          sellingPrice: price,                   // Selling Price
          warranty: row[2]?.trim() || "",       // Warranty
          color: row[3]?.trim() || "",          // Color
          category: row[4]?.trim() || "",       // Type → category
        });
      }

      // Get existing products for comparison
      const existingProducts = await ctx.runQuery(api.products.list);
      const existingMap = new Map(existingProducts.map((p) => [p.name.toLowerCase(), p]));

      let productsAdded = 0;
      let productsUpdated = 0;

      console.log("Products to insert/update:", products.length, products.slice(0, 3));
      
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
async function getGoogleAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600; // 1 hour

  // Create JWT claims
  const claims = {
    iss: clientEmail,
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
  
  return base64Decode(b64).buffer as ArrayBuffer;
}

// Base64 encoding/decoding using Uint8Array
function base64Decode(str: string): Uint8Array {
  const binaryString = atob(str);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function base64Encode(bytes: Uint8Array): string {
  let binaryString = "";
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString);
}

// Helper function for base64 decoding (for atob compatibility)
function atob(str: string): string {
  // Use built-in if available, otherwise polyfill
  if (typeof globalThis.atob === "function") {
    return globalThis.atob(str);
  }
  // Fallback polyfill
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  str = String(str).replace(/=+$/, "");
  for (let bc = 0, bs = 0, buffer, idx = 0; (buffer = str.charAt(idx++)); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
    buffer = chars.indexOf(buffer);
  }
  return output;
}

function btoa(str: string): string {
  // Use built-in if available, otherwise polyfill
  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(str);
  }
  // Fallback polyfill
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  for (let block = 0, charCode, idx = 0, map = chars; str.charAt(idx | 0) || (map = "=", idx % 1); output += map.charAt(63 & block >> 8 - idx % 1 * 8)) {
    charCode = str.charCodeAt(idx += 3 / 4);
    block = block << 8 | charCode;
  }
  return output;
}
