import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST() {
  try {
    console.log("Initializing system configuration...");
    
    // Initialize default configuration
    const configResult = await convex.mutation(api.config.initializeDefaults);
    console.log("Configuration initialized:", configResult);
    
    // Add sample products
    console.log("Adding sample products...");
    
    const sampleProducts = [
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
    
    for (const product of sampleProducts) {
      await convex.mutation(api.myFunctions.addProductExample, product);
      console.log(`Added product: ${product.name}`);
    }
    
    console.log("System initialization complete!");
    
    return NextResponse.json({ 
      success: true, 
      message: "System initialized successfully",
      productsAdded: sampleProducts.length 
    });
  } catch (error) {
    console.error("Error initializing system:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "System initialization endpoint",
    usage: "POST to initialize the system with sample data"
  });
}