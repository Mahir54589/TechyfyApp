import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import TelegramBot, { SendDocumentOptions } from "node-telegram-bot-api";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false });

// Authorized user ID from environment
const ALLOWED_USER_ID = process.env.TELEGRAM_USER_ID;

// Define conversation states
enum ConversationState {
  AWAITING_CUSTOMER_INFO = "awaiting_customer_info",
  AWAITING_PRODUCTS = "awaiting_products",
  AWAITING_QUANTITY = "awaiting_quantity",
  AWAITING_CONFIRMATION = "awaiting_confirmation",
}

// Type definitions
interface CustomerInfo {
  name: string;
  address: string;
  phone: string;
}

interface ConversationData {
  customerInfo?: CustomerInfo;
  foundProducts?: Array<{
    _id: string;
    name: string;
    color: string;
    warranty: string;
    sellingPrice: number;
  }>;
  quantities?: Array<{
    productIndex: number;
    quantity: number;
  }>;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  total?: number;
}

// Helper function to validate Bangladesh phone number
const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^01[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ""));
};

// Helper function to parse customer info
const parseCustomerInfo = (text: string): CustomerInfo | null => {
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
  const lines = text.split("\n").filter((line) => line.trim());
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
const sendMessage = async (
  chatId: number,
  text: string,
  options?: TelegramBot.SendMessageOptions
): Promise<void> => {
  try {
    await bot.sendMessage(chatId, text, options);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

// Helper function to check if user is authorized
const isAuthorized = (userId: number): boolean => {
  if (!ALLOWED_USER_ID) {
    console.error("TELEGRAM_USER_ID not set in environment variables");
    return false;
  }
  return userId.toString() === ALLOWED_USER_ID;
};

// Handle incoming messages
const handleMessage = async (msg: TelegramBot.Message): Promise<void> => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const userId = msg.from?.id;

  if (!userId || !text) {
    return;
  }

  // Check authorization
  if (!isAuthorized(userId)) {
    await sendMessage(
      chatId,
      "⛔ Unauthorized access. This bot is private and only responds to the authorized user."
    );
    console.warn(`Unauthorized access attempt from user ID: ${userId}`);
    return;
  }

  // Get current conversation state from Convex
  const stateRecord = await convex.query(api.conversationState.getState, {
    userId,
  });

  const currentState = (stateRecord?.state as ConversationState) ||
    ConversationState.AWAITING_CUSTOMER_INFO;
  const stateData: ConversationData = stateRecord?.data || {};

  // Handle commands
  if (text === "/start" || text === "/new") {
    await convex.mutation(api.conversationState.setState, {
      userId,
      state: ConversationState.AWAITING_CUSTOMER_INFO,
    });
    await sendMessage(
      chatId,
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
    await sendMessage(
      chatId,
      "📖 *Help*\n\n" +
        "/start or /new - Start a new invoice\n" +
        "/cancel - Cancel current invoice\n" +
        "/help - Show this help message\n\n" +
        "Phone number format: 01XXXXXXXXX (11 digits starting with 01)",
      { parse_mode: "Markdown" }
    );
    return;
  }

  if (text === "/cancel") {
    await convex.mutation(api.conversationState.clearState, { userId });
    await sendMessage(
      chatId,
      "❌ Invoice cancelled. Type /start to create a new invoice."
    );
    return;
  }

  // Handle based on current state
  switch (currentState) {
    case ConversationState.AWAITING_CUSTOMER_INFO: {
      const customerInfo = parseCustomerInfo(text);

      if (!customerInfo) {
        await sendMessage(
          chatId,
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
        await sendMessage(
          chatId,
          "❌ Invalid phone number. Please use Bangladesh format: 01XXXXXXXXX (11 digits starting with 01)"
        );
        return;
      }

      // Store customer info and move to next state
      await convex.mutation(api.conversationState.setState, {
        userId,
        state: ConversationState.AWAITING_PRODUCTS,
        data: { customerInfo },
      });

      await sendMessage(
        chatId,
        "✅ Customer details saved!\n" +
          `👤 Name: ${customerInfo.name}\n` +
          `📍 Address: ${customerInfo.address}\n` +
          `📞 Phone: ${customerInfo.phone}\n\n` +
          "Now send me the product names (one per line or comma-separated)"
      );
      break;
    }

    case ConversationState.AWAITING_PRODUCTS: {
      const productNames = text
        .split(/[,\n]/)
        .map((p) => p.trim())
        .filter((p) => p);

      if (productNames.length === 0) {
        await sendMessage(
          chatId,
          "❌ Please provide at least one product name."
        );
        return;
      }

      try {
        // Search for products in Convex
        const searchResults = [];

        for (const productName of productNames) {
          const results = await convex.query(api.products.search, {
            query: productName,
          });
          searchResults.push(...results);
        }

        if (searchResults.length === 0) {
          await sendMessage(
            chatId,
            "❌ No products found. Please check spelling and try again."
          );
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
        await convex.mutation(api.conversationState.setState, {
          userId,
          state: ConversationState.AWAITING_QUANTITY,
          data: {
            ...stateData,
            foundProducts: searchResults,
          },
        });
      } catch (error) {
        console.error("Error searching products:", error);
        await sendMessage(
          chatId,
          "❌ Error searching products. Please try again."
        );
      }
      break;
    }

    case ConversationState.AWAITING_QUANTITY: {
      if (!stateData.foundProducts) {
        await sendMessage(
          chatId,
          "❌ Error: No products found. Please start over with /start"
        );
        await convex.mutation(api.conversationState.clearState, { userId });
        return;
      }

      let quantities: Array<{ productIndex: number; quantity: number }>;

      if (text.toLowerCase() === "ok") {
        // Set default quantity of 1 for all products
        quantities = stateData.foundProducts.map((_, index) => ({
          productIndex: index,
          quantity: 1,
        }));
      } else {
        // Parse quantities
        const quantityMatches = text.match(/(\d+)\s*=\s*(\d+)/g);
        if (!quantityMatches) {
          await sendMessage(
            chatId,
            "❌ Invalid format. Use: 1=2, 2=1 (product number = quantity)\n" +
              "Or just 'OK' for 1 unit each"
          );
          return;
        }

        quantities = [];
        for (const match of quantityMatches) {
          const parts = match.split("=").map((s) => s.trim());
          const productIndex = parseInt(parts[0]) - 1; // Convert to 0-based index
          const quantity = parseInt(parts[1]);
          quantities.push({
            productIndex,
            quantity,
          });
        }
      }

      // Calculate line totals and prepare summary
      let subtotal = 0;
      let summary = "📋 *Invoice Summary*\n━━━━━━━━━━━━━━━━━━\n";

      // Check if all products exist before proceeding
      for (let i = 0; i < quantities.length; i++) {
        const item = quantities[i];
        const product = stateData.foundProducts[item.productIndex];
        if (!product) {
          await sendMessage(
            chatId,
            `❌ Error: Product not found for item ${
              i + 1
            }. Please start over with /start`
          );
          await convex.mutation(api.conversationState.clearState, { userId });
          return;
        }
      }

      // Now safely calculate totals
      quantities.forEach((item, index) => {
        const product = stateData.foundProducts![item.productIndex];
        const amount = product.sellingPrice * item.quantity;
        subtotal += amount;

        summary += `${index + 1}. ${product.name} x${item.quantity} — ${formatCurrency(
          amount
        )}\n`;
      });

      const taxRate = 0; // No VAT
      const taxAmount = 0;
      const total = subtotal;

      summary += `\nSubtotal: ${formatCurrency(subtotal)}\n`;
      // summary += `VAT (0%): ${formatCurrency(taxAmount)}\n`; // Hidden when 0
      summary += "━━━━━━━━━━━━━━━━━━\n";
      summary += `💰 Total: ${formatCurrency(total)}\n\n`;
      summary += "Reply 'OK' to generate invoice\n";
      summary += "Or edit price: '1 125000' (changes item 1 price to ৳125,000)";

      await sendMessage(chatId, summary, { parse_mode: "Markdown" });

      // Update state with calculated values
      await convex.mutation(api.conversationState.setState, {
        userId,
        state: ConversationState.AWAITING_CONFIRMATION,
        data: {
          ...stateData,
          quantities,
          subtotal,
          taxRate,
          taxAmount,
          total,
        },
      });
      break;
    }

    case ConversationState.AWAITING_CONFIRMATION: {
      if (!stateData.customerInfo || !stateData.foundProducts || !stateData.quantities) {
        await sendMessage(
          chatId,
          "❌ Error: No invoice data found. Please start over with /start"
        );
        await convex.mutation(api.conversationState.clearState, { userId });
        return;
      }

      if (text.toLowerCase() === "ok") {
        try {
          // Create invoice in Convex
          const items = stateData.quantities.map((item) => {
            const product = stateData.foundProducts![item.productIndex];
            return {
              productId: product._id as string,
              productName: product.name,
              color: product.color,
              warranty: product.warranty,
              quantity: item.quantity,
              unitPrice: product.sellingPrice,
              amount: product.sellingPrice * item.quantity,
            };
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const invoice = await convex.mutation(api.invoices.create, {
            customerName: stateData.customerInfo.name,
            customerAddress: stateData.customerInfo.address,
            customerPhone: stateData.customerInfo.phone,
            items: items as any,
            subtotal: stateData.subtotal!,
            taxRate: stateData.taxRate!,
            taxAmount: stateData.taxAmount!,
            total: stateData.total!,
          });

          if (!invoice) {
            await sendMessage(
              chatId,
              "❌ Failed to create invoice. Please try again."
            );
            return;
          }

          await sendMessage(chatId, "⏳ Generating PDF...");

          // Generate PDF
          const pdfResult = await convex.action(api.invoices.generatePDF, {
            invoiceId: invoice._id,
          });

          if (pdfResult.success && pdfResult.pdfBase64) {
            // Convert base64 to buffer
            const pdfBuffer = Buffer.from(pdfResult.pdfBase64, "base64");

            // Send PDF to user
            const docOptions: SendDocumentOptions = {
              caption:
                `✅ Invoice generated successfully!\n` +
                `📄 Invoice Number: ${invoice.invoiceNumber}\n` +
                `📅 Date: ${new Date(invoice.date).toLocaleDateString()}\n\n` +
                "You can download and share this PDF with your customer.",
            };
            await bot.sendDocument(chatId, pdfBuffer, docOptions);
          } else {
            await sendMessage(
              chatId,
              `❌ Failed to generate PDF: ${pdfResult.message}`
            );
          }

          // Clear conversation state
          await convex.mutation(api.conversationState.clearState, { userId });
        } catch (error) {
          console.error("Error creating invoice:", error);
          await sendMessage(
            chatId,
            "❌ Error creating invoice. Please try again."
          );
        }
      } else {
        // Try to parse price edit
        const priceEditMatch = text.match(/(\d+)\s+(\d+)/);
        if (priceEditMatch) {
          const itemIndex = parseInt(priceEditMatch[1]) - 1; // Convert to 0-based index
          const newPrice = parseInt(priceEditMatch[2]);

          if (
            itemIndex >= 0 &&
            itemIndex < stateData.quantities.length &&
            stateData.foundProducts
          ) {
            const productIndex = stateData.quantities[itemIndex].productIndex;
            const product = stateData.foundProducts[productIndex];

            // Create a copy of foundProducts with updated price
            const updatedProducts = [...stateData.foundProducts];
            updatedProducts[productIndex] = {
              ...product,
              sellingPrice: newPrice,
            };

            // Recalculate totals
            let newSubtotal = 0;
            stateData.quantities.forEach((item) => {
              const p = updatedProducts[item.productIndex];
              newSubtotal += p.sellingPrice * item.quantity;
            });

            const newTaxAmount = newSubtotal * stateData.taxRate!;
            const newTotal = newSubtotal + newTaxAmount;

            // Show updated summary
            let summary =
              "✅ Price updated!\n\n📋 *Updated Invoice Summary*\n━━━━━━━━━━━━━━━━━━\n";

            stateData.quantities.forEach((item, idx) => {
              const p = updatedProducts[item.productIndex];
              const amount = p.sellingPrice * item.quantity;
              summary += `${idx + 1}. ${p.name} x${item.quantity} — ${formatCurrency(
                amount
              )}\n`;
            });

            summary += `\nSubtotal: ${formatCurrency(newSubtotal)}\n`;
            // summary += `VAT (0%): ${formatCurrency(newTaxAmount)}\n`; // Hidden when 0
            summary += "━━━━━━━━━━━━━━━━━━\n";
            summary += `💰 Total: ${formatCurrency(newTotal)}\n\n`;
            summary += "Reply 'OK' to confirm";

            await sendMessage(chatId, summary, { parse_mode: "Markdown" });

            // Update state
            await convex.mutation(api.conversationState.setState, {
              userId,
              state: ConversationState.AWAITING_CONFIRMATION,
              data: {
                ...stateData,
                foundProducts: updatedProducts,
                subtotal: newSubtotal,
                taxAmount: newTaxAmount,
                total: newTotal,
              },
            });
          } else {
            await sendMessage(chatId, "❌ Invalid item number. Please try again.");
          }
        } else {
          await sendMessage(
            chatId,
            "❌ Invalid input. Reply 'OK' to generate invoice\n" +
              "Or edit price: '1 125000' (changes item 1 price to ৳125,000)"
          );
        }
      }
      break;
    }
  }
};

// Webhook handler
export async function POST(request: NextRequest): Promise<NextResponse> {
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
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: "Telegram bot webhook is running" });
}
