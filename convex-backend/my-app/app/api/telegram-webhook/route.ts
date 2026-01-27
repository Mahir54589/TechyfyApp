import { NextRequest, NextResponse } from "next/server";
import TelegramBot from "node-telegram-bot-api";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!);

// Store conversation state (in production, this should be stored in a database)
const conversationStates = new Map<number, any>();

// Define conversation states
enum ConversationState {
  AWAITING_CUSTOMER_INFO = "awaiting_customer_info",
  AWAITING_PRODUCTS = "awaiting_products",
  AWAITING_QUANTITY = "awaiting_quantity",
  AWAITING_CONFIRMATION = "awaiting_confirmation",
}

// Helper function to validate Bangladesh phone number
const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^01[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ""));
};

// Helper function to parse customer info
const parseCustomerInfo = (text: string) => {
  // Try comma-separated format first
  const commaMatch = text.match(/^([^,]+),\s*([^,]+),\s*(.+)$/);
  if (commaMatch) {
    return {
      name: commaMatch[1].trim(),
      address: commaMatch[2].trim(),
      phone: commaMatch[3].trim(),
    };
  }
  
  // Try line-separated format
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length >= 3) {
    return {
      name: lines[0].trim(),
      address: lines[1].trim(),
      phone: lines[2].trim(),
    };
  }
  
  return null;
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return `৳${amount.toLocaleString("en-IN")}`;
};

// Helper function to send message
const sendMessage = async (chatId: number, text: string, options?: any) => {
  try {
    await bot.sendMessage(chatId, text, options);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

// Handle incoming messages
const handleMessage = async (msg: any) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Get current conversation state
  const currentState = conversationStates.get(chatId) || ConversationState.AWAITING_CUSTOMER_INFO;
  
  // Handle commands
  if (text === "/start" || text === "/new") {
    conversationStates.set(chatId, ConversationState.AWAITING_CUSTOMER_INFO);
    await sendMessage(chatId, 
      "👋 Welcome to the Invoice Generator Bot!\n\n" +
      "Please provide customer information in one of these formats:\n\n" +
      "Format 1 (comma-separated):\n" +
      "Customer Name, Address, Phone Number\n\n" +
      "Format 2 (line-separated):\n" +
      "Customer Name\n" +
      "Address\n" +
      "Phone Number\n\n" +
      "Example: Rahul Ahmed, Dhanmondi Road 27, Dhaka 1209, 01712345678"
    );
    return;
  }
  
  if (text === "/help") {
    await sendMessage(chatId,
      "📖 *Help*\n\n" +
      "/start or /new - Start a new invoice\n" +
      "/cancel - Cancel current invoice\n" +
      "/help - Show this help message\n\n" +
      "Phone number format: 01XXXXXXXXX (11 digits starting with 01)"
    );
    return;
  }
  
  if (text === "/cancel") {
    conversationStates.delete(chatId);
    await sendMessage(chatId, "❌ Invoice cancelled. Type /start to create a new invoice.");
    return;
  }
  
  // Handle based on current state
  switch (currentState) {
    case ConversationState.AWAITING_CUSTOMER_INFO:
      const customerInfo = parseCustomerInfo(text);
      
      if (!customerInfo) {
        await sendMessage(chatId,
          "❌ Invalid format. Please use one of these formats:\n\n" +
          "Format 1 (comma-separated):\n" +
          "Customer Name, Address, Phone Number\n\n" +
          "Format 2 (line-separated):\n" +
          "Customer Name\n" +
          "Address\n" +
          "Phone Number"
        );
        return;
      }
      
      // Validate phone number
      if (!validatePhone(customerInfo.phone)) {
        await sendMessage(chatId,
          "❌ Invalid phone number. Please use Bangladesh format: 01XXXXXXXXX (11 digits starting with 01)"
        );
        return;
      }
      
      // Store customer info and move to next state
      conversationStates.set(chatId, {
        state: ConversationState.AWAITING_PRODUCTS,
        customerInfo,
      });
      
      await sendMessage(chatId,
        "✅ Customer details saved!\n" +
        `👤 Name: ${customerInfo.name}\n` +
        `📍 Address: ${customerInfo.address}\n` +
        `📞 Phone: ${customerInfo.phone}\n\n` +
        "Now send me the product names (one per line or comma-separated)"
      );
      break;
      
    case ConversationState.AWAITING_PRODUCTS:
      const state = conversationStates.get(chatId);
      const productNames = text.split(/[,\\n]/).map((p: string) => p.trim()).filter((p: string) => p);
      
      if (productNames.length === 0) {
        await sendMessage(chatId, "❌ Please provide at least one product name.");
        return;
      }
      
      try {
        // Search for products in Convex
        const searchResults = [];
        
        for (const productName of productNames) {
          const results = await convex.query(api.products.search, { query: productName });
          searchResults.push(...results);
        }
        
        if (searchResults.length === 0) {
          await sendMessage(chatId, "❌ No products found. Please check spelling and try again.");
          return;
        }
        
        // Display found products
        let message = "Found products:\n\n";
        searchResults.forEach((product, index) => {
          message += `${index + 1}️⃣ ${product.name}\n`;
          message += `   Color: ${product.color}\n`;
          message += `   Warranty: ${product.warranty}\n`;
          message += `   Price: ${formatCurrency(product.sellingPrice)}\n\n`;
        });
        
        message += "Reply with quantity for each:\n";
        message += "Format: 1=2, 2=1 (product number = quantity)\n";
        message += "Or just 'OK' for 1 unit each";
        
        await sendMessage(chatId, message);
        
        // Update state with found products
        conversationStates.set(chatId, {
          ...state,
          state: ConversationState.AWAITING_QUANTITY,
          foundProducts: searchResults,
        });
      } catch (error) {
        console.error("Error searching products:", error);
        await sendMessage(chatId, "❌ Error searching products. Please try again.");
      }
      break;
      
    case ConversationState.AWAITING_QUANTITY:
      const quantityState = conversationStates.get(chatId);
      
      if (text.toLowerCase() === "ok") {
        // Set default quantity of 1 for all products
        quantityState.quantities = quantityState.foundProducts.map((_: any, index: number) => ({
          productIndex: index,
          quantity: 1,
        }));
      } else {
        // Parse quantities
        const quantityMatches = text.match(/(\\d+)\\s*=\\s*(\\d+)/g);
        if (!quantityMatches) {
          await sendMessage(chatId,
            "❌ Invalid format. Use: 1=2, 2=1 (product number = quantity)\n" +
            "Or just 'OK' for 1 unit each"
          );
          return;
        }
        
        const quantities = [];
        for (const match of quantityMatches) {
          const [_, productIndex, quantity] = match.split("=").map((s: string) => s.trim());
          quantities.push({
            productIndex: parseInt(productIndex) - 1, // Convert to 0-based index
            quantity: parseInt(quantity),
          });
        }
        
        quantityState.quantities = quantities;
      }
      
      // Calculate line totals and prepare summary
      let subtotal = 0;
      let summary = "📋 *Invoice Summary*\n━━━━━━━━━━━━━━━━━━\n";
      
      quantityState.quantities.forEach((item: any, index: number) => {
        const product = quantityState.foundProducts[item.productIndex];
        const amount = product.sellingPrice * item.quantity;
        subtotal += amount;
        
        summary += `${index + 1}. ${product.name} x${item.quantity} — ${formatCurrency(amount)}\n`;
      });
      
      const taxRate = 0.15; // 15% VAT
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;
      
      summary += `\nSubtotal: ${formatCurrency(subtotal)}\n`;
      summary += `VAT (15%): ${formatCurrency(taxAmount)}\n`;
      summary += "━━━━━━━━━━━━━━━━━━\n";
      summary += `💰 Total: ${formatCurrency(total)}\n\n`;
      summary += "Reply 'OK' to generate invoice\n";
      summary += "Or edit price: '1 125000' (changes item 1 price to ৳125,000)";
      
      await sendMessage(chatId, summary);
      
      // Update state with calculated values
      conversationStates.set(chatId, {
        ...quantityState,
        state: ConversationState.AWAITING_CONFIRMATION,
        subtotal,
        taxRate,
        taxAmount,
        total,
      });
      break;
      
    case ConversationState.AWAITING_CONFIRMATION:
      const confirmationState = conversationStates.get(chatId);
      
      if (text.toLowerCase() === "ok") {
        try {
          // Create invoice in Convex
          const items = confirmationState.quantities.map((item: any) => {
            const product = confirmationState.foundProducts[item.productIndex];
            return {
              productId: product._id,
              productName: product.name,
              color: product.color,
              warranty: product.warranty,
              quantity: item.quantity,
              unitPrice: product.sellingPrice,
              amount: product.sellingPrice * item.quantity,
            };
          });
          
          const invoice = await convex.mutation(api.invoices.create, {
            customerName: confirmationState.customerInfo.name,
            customerAddress: confirmationState.customerInfo.address,
            customerPhone: confirmationState.customerInfo.phone,
            items,
            subtotal: confirmationState.subtotal,
            taxRate: confirmationState.taxRate,
            taxAmount: confirmationState.taxAmount,
            total: confirmationState.total,
          });
          
          await sendMessage(chatId, "⏳ Generating invoice...");
          
          // Generate PDF
          const pdfResult = await convex.action(api.invoices.generatePDF, {
            invoiceId: invoice._id,
          });
          
          if (pdfResult.success) {
            await sendMessage(chatId,
              `✅ Invoice generated successfully!\n` +
              `📄 Invoice Number: ${invoice.invoiceNumber}\n` +
              `📅 Date: ${new Date(invoice.date).toLocaleDateString()}\n\n` +
              "You can download and share this PDF with your customer."
            );
          } else {
            await sendMessage(chatId, "❌ Failed to generate PDF. Please try again.");
          }
          
          // Reset conversation state
          conversationStates.delete(chatId);
        } catch (error) {
          console.error("Error creating invoice:", error);
          await sendMessage(chatId, "❌ Error creating invoice. Please try again.");
        }
      } else {
        // Try to parse price edit
        const priceEditMatch = text.match(/(\\d+)\\s+(\\d+)/);
        if (priceEditMatch) {
          const [_, itemIndex, newPrice] = priceEditMatch;
          const index = parseInt(itemIndex) - 1; // Convert to 0-based index
          
          if (index >= 0 && index < confirmationState.quantities.length) {
            const productIndex = confirmationState.quantities[index].productIndex;
            const product = confirmationState.foundProducts[productIndex];
            const oldPrice = product.sellingPrice;
            const newPriceNum = parseInt(newPrice);
            
            // Update product price temporarily
            product.sellingPrice = newPriceNum;
            
            // Recalculate totals
            let newSubtotal = 0;
            confirmationState.quantities.forEach((item: any) => {
              const p = confirmationState.foundProducts[item.productIndex];
              newSubtotal += p.sellingPrice * item.quantity;
            });
            
            const newTaxAmount = newSubtotal * confirmationState.taxRate;
            const newTotal = newSubtotal + newTaxAmount;
            
            // Update state
            confirmationState.subtotal = newSubtotal;
            confirmationState.taxAmount = newTaxAmount;
            confirmationState.total = newTotal;
            
            // Show updated summary
            let summary = "✅ Price updated!\n\n📋 *Updated Invoice Summary*\n━━━━━━━━━━━━━━━━━━\n";
            
            confirmationState.quantities.forEach((item: any, idx: number) => {
              const p = confirmationState.foundProducts[item.productIndex];
              const amount = p.sellingPrice * item.quantity;
              summary += `${idx + 1}. ${p.name} x${item.quantity} — ${formatCurrency(amount)}\n`;
            });
            
            summary += `\nSubtotal: ${formatCurrency(newSubtotal)}\n`;
            summary += `VAT (15%): ${formatCurrency(newTaxAmount)}\n`;
            summary += "━━━━━━━━━━━━━━━━━━\n";
            summary += `💰 Total: ${formatCurrency(newTotal)}\n\n`;
            summary += "Reply 'OK' to confirm";
            
            await sendMessage(chatId, summary);
          } else {
            await sendMessage(chatId, "❌ Invalid item number. Please try again.");
          }
        } else {
          await sendMessage(chatId,
            "❌ Invalid input. Reply 'OK' to generate invoice\n" +
            "Or edit price: '1 125000' (changes item 1 price to ৳125,000)"
          );
        }
      }
      break;
  }
};

// Webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Process each update
    if (body.message) {
      await handleMessage(body.message);
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

// For webhook setup
export async function GET() {
  return NextResponse.json({ status: "Telegram bot webhook is running" });
}