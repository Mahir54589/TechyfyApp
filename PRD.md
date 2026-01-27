# Product Requirements Document (PRD)
## Invoice Generation Webapp with Telegram Bot Integration

**Version:** 1.0 MVP  
**Last Updated:** January 28, 2026  
**Status:** Draft  
**Build Method:** AI Agent Automated Development

> **📌 SOURCE OF TRUTH:** This document is the single source of truth for the entire project. All development decisions, technical specifications, and business requirements are documented here. The AI agent will follow this document exactly and prompt the user for any required information not specified here.

---

## 🤖 AI Agent Quick Start Guide

This PRD is optimized for AI coding agents (like Cursor, Claude Code, Replit Agent, etc.). Follow this sequence:

### Build Order:
1. **Phase 1: Convex Backend** → Foundation (start here)
2. **Phase 2: PDF Service** → Can build in parallel with Phase 1
3. **Phase 3: Telegram Bot** → Requires Phase 1 & 2 complete
4. **Phase 4: Testing** → Final validation

### Key Implementation Notes:
- **Incremental Development:** Build and test each component separately
- **No Time Constraints:** Complete each phase fully before moving to next
- **Testing Required:** Each function must work before integration
- **Simple First:** Use in-memory state, add persistence later if needed

### Critical Success Factors:
- ✅ Invoice numbering must be atomic (no race conditions)
- ✅ PDF must match existing Word template design
- ✅ Bot conversation flow must be intuitive
- ✅ All parsing (customer info, products) must handle both formats

### Recommended Tech Stack:
- **Backend:** Convex (simplest for AI agents, no server setup)
- **PDF:** Puppeteer (most reliable) or @react-pdf/renderer
- **Bot:** Grammy or node-telegram-bot-api
- **Hosting:** Vercel (zero config deployment)

---

## ⚙️ Configuration Required (User Input Needed)

**IMPORTANT:** Before the AI agent can begin development, the following information must be provided by the user. The agent will prompt for these details when needed.

### 1. Company/Business Information
**Status:** ⏳ REQUIRED - Agent will prompt user

**Information Needed:**
- [ ] Company Name
- [ ] Company Address (Bangladesh)
- [ ] Company Email
- [ ] Company Phone Number
- [ ] BIN (Business Identification Number) / Trade License Number
- [ ] Company Logo (image file or URL)
- [ ] Payment Details (bKash/Nagad/Bank account for invoice footer)

**Where Used:** Invoice PDF Header, Footer, Biller Information section

---

### 2. Google Sheets Configuration
**Status:** ⏳ REQUIRED - Agent will prompt user

**Information Needed:**
- [ ] Google Sheet URL or ID
- [ ] Google Sheets API Key (or Service Account JSON)
- [ ] Confirmation that sheet has correct structure:
  - Column A: Product Name
  - Column B: Color/Variant
  - Column C: Warranty
  - Column D: Category
  - Column E: Selling Price (in BDT, numbers only)

**Setup Instructions for User:**
1. Create a Google Sheet with the above columns
2. Enable Google Sheets API in Google Cloud Console
3. Create API credentials (API Key or Service Account)
4. Share sheet with service account email (if using service account)
5. Provide Sheet ID (from URL) and credentials to agent

**Where Used:** Product data sync to Convex database

---

### 3. Telegram Bot Configuration
**Status:** ⏳ REQUIRED - Agent will prompt user

**Information Needed:**
- [ ] Telegram Bot Token (from BotFather)
- [ ] Telegram User ID (business owner's Telegram user ID for access control)

**Setup Instructions for User:**
1. Open Telegram and search for "@BotFather"
2. Send `/newbot` command
3. Follow prompts to create bot:
   - Choose bot name (e.g., "MyStore Invoice Bot")
   - Choose username (e.g., "mystoreinvoice_bot")
4. Copy the bot token provided by BotFather
5. Send `/start` to @userinfobot to get your Telegram User ID
6. Provide both token and user ID to agent

**Where Used:** Telegram bot authentication and user access control

---

### 4. Convex Configuration
**Status:** 🤖 AUTO - Agent will handle this

**Information Needed:**
- Agent will create Convex account if needed
- Agent will initialize Convex project
- No user input required (agent handles setup)

**Where Used:** Backend database and API

---

### 5. Vercel Configuration
**Status:** 🤖 AUTO - Agent will handle this

**Information Needed:**
- Agent will deploy to Vercel
- Agent will configure environment variables
- No user input required (agent handles deployment)

**Where Used:** Hosting Next.js PDF generation service and Telegram bot webhook

---

### 6. Invoice Customization (Optional)
**Status:** ✅ OPTIONAL - Agent will use defaults, user can customize later

**Default Values:**
- VAT Rate: 15% (Bangladesh standard)
- Currency: BDT (৳)
- Invoice Number Format: YYYYMM###
- Date Format: DD/MM/YYYY

**Customizable Options:**
- [ ] Custom VAT rate (if different from 15%)
- [ ] Invoice terms & conditions text
- [ ] Footer message (default: "Thank you for your business!")
- [ ] Color scheme for invoice PDF

**Where Used:** Invoice PDF generation and calculations

---

### 7. Word Template (for Reference)
**Status:** ✅ OPTIONAL - Helps match design exactly

**Information Needed:**
- [ ] Upload existing Word invoice template (if available)
- Agent will replicate design in PDF format

**If Provided:** Agent will match layout, fonts, colors, spacing
**If Not Provided:** Agent will use standard professional invoice design

**Where Used:** PDF invoice template design

---

## 📋 Pre-Development Checklist

Before starting development, ensure:
- [ ] Company information ready (name, address, BIN, logo, etc.)
- [ ] Google Sheet created with correct structure
- [ ] Google Sheets API enabled and credentials obtained
- [ ] Telegram bot created and token obtained
- [ ] User's Telegram ID obtained
- [ ] (Optional) Word template uploaded for design reference

**When Ready:** Type "START DEVELOPMENT" and the agent will begin Phase 1

---

## 1. Executive Summary

### 1.1 Product Overview
A streamlined invoice generation system that replaces manual Word document creation with an automated web-based solution. The system integrates with Telegram for quick invoice generation on-the-go, fetches product data from Google Sheets, and generates professional PDF invoices following the existing business format.

### 1.2 Problem Statement
Currently, the business (online retail gadget store in Bangladesh) uses Microsoft Word for manual invoice creation, which is:
- Time-consuming and repetitive
- Prone to human error
- Requires constant manual updates to product pricing
- Not mobile-friendly for on-the-go invoice generation
- Inefficient for customer service workflow

### 1.3 Solution
A web application with Telegram bot interface that:
- Automates invoice generation with pre-designed templates
- Fetches real-time product data from Google Sheets
- Provides conversational interface via Telegram
- Generates professional PDF invoices instantly
- Maintains sequential invoice numbering (YYYYMM### format)

### 1.4 Success Metrics
- **Primary:** Generate first invoice end-to-end within 2 minutes
- **Primary:** 100% invoice numbering accuracy
- **Secondary:** Reduce invoice generation time by 80% (from ~10 minutes to ~2 minutes)
- **Secondary:** Zero manual data entry errors

---

## 2. User Personas

### 2.1 Primary User: Business Owner/Sales Representative
- **Role:** Generates invoices for customers
- **Tech Savvy:** Moderate
- **Primary Device:** Mobile phone (Telegram)
- **Pain Points:** 
  - Manual invoice creation is slow
  - Updating prices requires opening Word documents
  - Not accessible when away from computer
- **Goals:**
  - Generate invoices quickly from anywhere
  - Ensure accuracy in pricing and product details
  - Maintain professional invoice format

---

## 3. Functional Requirements

### 3.1 Data Management

#### 3.1.1 Google Sheets Integration (Product Database)
**Priority:** P0 (Critical)

**Requirements:**
- Google Sheet serves as single source of truth for product data
- Sheet structure:
  - Column A: Product Name (text)
  - Column B: Color/Variant (text)
  - Column C: Warranty (text, e.g., "1 Year", "2 Years")
  - Column D: Category (text)
  - Column E: Selling Price (number)

**Acceptance Criteria:**
- System fetches product data from Google Sheets via API
- Products sync to Convex database on-demand or periodically
- Manual price updates in Google Sheets reflect in system within 5 minutes

#### 3.1.2 Invoice Counter Management
**Priority:** P0 (Critical)

**Requirements:**
- Invoice numbering format: `YYYYMM###` (e.g., 202501001, 202501002)
- Counter resets to 001 at the start of each month
- Counter persists across system restarts
- Sequential numbering guaranteed (no duplicates)

**Acceptance Criteria:**
- Invoice numbers increment sequentially
- Counter automatically resets on month change
- No duplicate invoice numbers generated
- Invoice number visible in final PDF

---

### 3.2 Telegram Bot Interface

#### 3.2.1 Bot Setup
**Priority:** P0 (Critical)

**Requirements:**
- Bot created via Telegram BotFather
- Bot accessible via username/link
- Bot available 24/7
- Single-user access for MVP (business owner only)

#### 3.2.2 Conversation Flow - Customer Information Input
**Priority:** P0 (Critical)

**User Input Format (Flexible):**
```
Option 1 (Comma-separated):
Customer Name, Address, Phone Number

Option 2 (Line-separated):
Customer Name
Address
Phone Number
```

**Requirements:**
- Bot accepts both comma-separated and line-break separated input
- Bot parses and extracts:
  1. Customer Name (first element)
  2. Address (second element)
  3. Phone Number (third element)
- Bot validates phone number format (11 digits starting with 01, e.g., 01712345678)
- Bot displays parsed information for confirmation

**Example Interaction:**
```
User: "Rahul Ahmed, Dhanmondi Road 27, Dhaka 1209, 01712345678"

Bot: "✅ Customer details saved!
👤 Name: Rahul Ahmed
📍 Address: Dhanmondi Road 27, Dhaka 1209
📞 Phone: 01712345678

Now send me the product names (one per line or comma-separated)"
```

**Acceptance Criteria:**
- Bot correctly parses both input formats
- Bot validates phone number (basic validation)
- Bot displays confirmation before proceeding
- Invalid input triggers error message with format example

#### 3.2.3 Conversation Flow - Product Selection
**Priority:** P0 (Critical)

**User Input Format:**
```
Option 1: Product Name 1, Product Name 2, Product Name 3
Option 2: 
Product Name 1
Product Name 2
Product Name 3
```

**Requirements:**
- Bot accepts multiple products (comma or line-separated)
- Bot performs fuzzy search on product names
- Partial matches are acceptable (e.g., "iPhone" matches "iPhone 15 Pro")
- Bot displays matched products with details:
  - Product name
  - Color/Variant
  - Warranty
  - Current selling price
- If multiple matches found, bot shows options for user to choose
- If no match found, bot notifies and allows retry

**Example Interaction:**
```
User: "iPhone, AirPods"

Bot: "Found 2 products:

1️⃣ iPhone 15 Pro
   Color: Space Black
   Warranty: 1 Year
   Price: ৳1,29,900

2️⃣ AirPods Pro (2nd Gen)
   Color: White
   Warranty: 1 Year
   Price: ৳24,900

Reply with quantity for each:
Format: 1=2, 2=1 (product number = quantity)
Or just 'OK' for 1 unit each"
```

**Acceptance Criteria:**
- Fuzzy matching works for partial product names
- Bot displays all matched products with complete details
- Bot handles "no match" scenarios gracefully
- User can retry product search if needed

#### 3.2.4 Conversation Flow - Quantity Input
**Priority:** P0 (Critical)

**Requirements:**
- Default quantity is 1 for each product
- User can specify quantity in format: `1=2, 2=1` (product number = quantity)
- Bot calculates line totals (unit price × quantity)

**Example Interaction:**
```
User: "1=2, 2=1"

Bot: "✅ Quantities updated!

1️⃣ iPhone 15 Pro x2 = ৳2,59,800
2️⃣ AirPods Pro x1 = ৳24,900"
```

**Acceptance Criteria:**
- Default quantity is 1 if not specified
- Bot correctly parses quantity input
- Line totals calculated accurately

#### 3.2.5 Conversation Flow - Price Confirmation & Editing
**Priority:** P0 (Critical)

**Requirements:**
- Bot displays invoice summary:
  - All line items with quantities and amounts
  - Subtotal
  - VAT (15% - standard rate in Bangladesh)
  - Grand Total
- User can confirm with "OK" or "Confirm"
- User can edit individual product prices
- Edit format: `Product Number New Price` (e.g., "1 125000")

**Example Interaction:**
```
Bot: "📋 Invoice Summary
━━━━━━━━━━━━━━━━━
1. iPhone 15 Pro x2 — ৳2,59,800
2. AirPods Pro x1 — ৳24,900

Subtotal: ৳2,84,700
VAT (15%): ৳42,705
━━━━━━━━━━━━━━━━━
💰 Total: ৳3,27,405

Reply 'OK' to generate invoice
Or edit price: '1 125000' (changes item 1 price to ৳125,000)"

User: "1 125000"

Bot: "✅ Price updated!

📋 Updated Invoice Summary
━━━━━━━━━━━━━━━━━
1. iPhone 15 Pro x2 — ৳2,50,000
2. AirPods Pro x1 — ৳24,900

Subtotal: ৳2,74,900
VAT (15%): ৳41,235
━━━━━━━━━━━━━━━━━
💰 Total: ৳3,16,135

Reply 'OK' to confirm"
```

**Acceptance Criteria:**
- Summary displays all line items correctly
- Tax calculation is accurate
- Price editing works for any product
- Edited prices recalculate totals automatically
- User can edit multiple times before confirming

#### 3.2.6 Conversation Flow - Invoice Generation
**Priority:** P0 (Critical)

**Requirements:**
- On confirmation, bot triggers invoice generation
- Bot shows "Generating invoice..." status message
- PDF generated and sent back to user within 10 seconds
- Bot displays success message with invoice number

**Example Interaction:**
```
User: "OK"

Bot: "⏳ Generating invoice..."

[PDF file sent]

Bot: "✅ Invoice generated successfully!
📄 Invoice Number: 202601015
📅 Date: January 28, 2026

You can download and share this PDF with your customer."
```

**Acceptance Criteria:**
- PDF generation completes within 10 seconds
- PDF sent to user successfully
- Invoice number displayed in confirmation message
- User can generate another invoice immediately after

---

### 3.3 Invoice PDF Generation

#### 3.3.1 Invoice Design
**Priority:** P0 (Critical)

**Requirements:**
- PDF matches existing Word template design
- Professional, clean layout
- A4 size (210mm × 297mm)

**Invoice Components (Top to Bottom):**

1. **Header Section:**
   - Company Logo (left aligned)
   - Company Name (bold, large font)
   - Company Address (Bangladesh), Email, Phone (right aligned)
   - BIN (Business Identification Number) / Trade License Number

2. **Invoice Title:**
   - "INVOICE" (centered, bold, large)

3. **Invoice Details Bar:**
   - Invoice Number: YYYYMM### (left)
   - Date: DD/MM/YYYY (right)

4. **Biller Information (Constant):**
   - **Billed By:**
   - Business Name
   - Business Address (Bangladesh)
   - BIN / Trade License
   - Business Contact

5. **Customer Information (Variable):**
   - **Billed To:**
   - Customer Name
   - Customer Address
   - Customer Phone

6. **Products Table:**
   - Column Headers:
     - S.No. (Serial Number)
     - Product Name
     - Unit (Quantity)
     - Warranty
     - Unit Price (৳)
     - Amount (৳)
   - Row for each product with alternating background colors

7. **Totals Section (right aligned):**
   - Subtotal: ৳X,XX,XXX
   - VAT (15%): ৳X,XX,XXX
   - **Grand Total: ৳X,XX,XXX** (bold, larger font)

8. **Footer Section:**
   - Terms & Conditions (if applicable)
   - Payment Instructions (bKash/Nagad/Bank details)
   - "Thank you for your business!"
   - Company signature/stamp area

**Acceptance Criteria:**
- PDF visually matches existing Word template
- All text is readable and properly formatted
- Currency formatted with ৳ symbol and thousand separators (৳1,29,900)
- Tables are aligned and professional
- PDF file size < 500KB

#### 3.3.2 PDF Generation Technical Requirements
**Priority:** P0 (Critical)

**Requirements:**
- Generate PDF server-side (Vercel API route)
- PDF library: react-pdf or jsPDF or Puppeteer
- PDF sent as file buffer to Telegram bot
- PDF filename format: `Invoice_YYYYMM###_CustomerName.pdf`

**Acceptance Criteria:**
- PDF generates successfully 100% of the time
- PDF opens correctly in all PDF readers
- PDF is print-ready (A4 size, 300 DPI quality)
- Generation time < 5 seconds

---

### 3.4 Backend (Convex)

#### 3.4.1 Database Schema
**Priority:** P0 (Critical)

**Tables:**

**1. products**
```javascript
{
  _id: string (auto-generated),
  name: string,
  color: string,
  warranty: string,
  category: string,
  sellingPrice: number,
  lastUpdated: timestamp,
  _creationTime: timestamp
}
```

**2. invoices**
```javascript
{
  _id: string (auto-generated),
  invoiceNumber: string, // "202601015"
  date: timestamp,
  customerName: string,
  customerAddress: string,
  customerPhone: string,
  items: array[{
    productId: string,
    productName: string,
    color: string,
    warranty: string,
    quantity: number,
    unitPrice: number,
    amount: number
  }],
  subtotal: number,
  taxRate: number, // 0.15 for 15% VAT (Bangladesh standard)
  taxAmount: number,
  total: number,
  pdfUrl: string (optional),
  _creationTime: timestamp
}
```

**3. invoiceCounter**
```javascript
{
  _id: string (auto-generated),
  yearMonth: string, // "202601"
  counter: number, // 15
  _creationTime: timestamp
}
```

**4. systemConfig**
```javascript
{
  _id: string (auto-generated),
  key: string, // "vatRate", "companyInfo"
  value: any, // JSON object (e.g., {"rate": 0.15, "label": "VAT (15%)"})
  _creationTime: timestamp
}
```

**Acceptance Criteria:**
- Schema defined in Convex
- All fields properly typed
- Indexes created for frequently queried fields (invoiceNumber, date)

#### 3.4.2 Convex Functions
**Priority:** P0 (Critical)

**Queries:**
- `products.list()` - Get all products
- `products.search(query: string)` - Fuzzy search products by name
- `invoices.getByNumber(invoiceNumber: string)` - Get invoice by number
- `invoices.list(limit: number)` - Get recent invoices
- `config.get(key: string)` - Get system configuration

**Mutations:**
- `products.syncFromGoogleSheets()` - Fetch and update products from Google Sheets
- `invoices.create(data)` - Create new invoice with auto-incrementing number
- `invoiceCounter.increment(yearMonth: string)` - Increment counter for current month
- `config.set(key: string, value: any)` - Update system configuration

**Actions:**
- `invoices.generatePDF(invoiceId: string)` - Trigger PDF generation via Vercel API

**Acceptance Criteria:**
- All functions work as expected
- Error handling implemented
- Functions have proper input validation

---

### 3.5 Web Application (Next.js)

#### 3.5.1 PDF Generation API
**Priority:** P0 (Critical)

**Endpoint:** `/api/generate-invoice-pdf`

**Method:** POST

**Request Body:**
```json
{
  "invoiceNumber": "202601015",
  "date": "2026-01-28",
  "customerName": "Rahul Ahmed",
  "customerAddress": "Dhanmondi Road 27, Dhaka 1209",
  "customerPhone": "01712345678",
  "items": [
    {
      "productName": "iPhone 15 Pro",
      "color": "Space Black",
      "warranty": "1 Year",
      "quantity": 2,
      "unitPrice": 129900,
      "amount": 259800
    }
  ],
  "subtotal": 284700,
  "taxRate": 0.15,
  "taxAmount": 42705,
  "total": 327405
}
```

**Response:**
- PDF file buffer (binary)
- Content-Type: application/pdf
- Status 200 on success
- Status 400/500 on error with error message

**Acceptance Criteria:**
- API endpoint accessible from Convex
- PDF generated correctly from request data
- Error handling implemented
- Response time < 5 seconds

#### 3.5.2 Manual Invoice Creation UI (Optional for MVP)
**Priority:** P2 (Nice to Have)

**Requirements:**
- Simple web form for manual invoice creation
- Same functionality as Telegram bot
- Hosted at root URL
- Responsive design

**Acceptance Criteria:**
- Form works on desktop and mobile
- Generates same PDF as Telegram bot
- Can be accessed via browser

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Invoice generation (end-to-end): < 2 minutes
- PDF generation: < 10 seconds
- Product search: < 2 seconds
- Bot response time: < 3 seconds
- System uptime: > 99% (for free tier services)

### 4.2 Security
- Telegram bot accessible only to authorized user (business owner)
- Google Sheets data read-only access
- No sensitive customer data stored long-term (optional for MVP)
- HTTPS for all API communications

### 4.3 Scalability
- Support for up to 100 products in database
- Generate up to 50 invoices per day
- Support for 999 invoices per month (counter limit)

### 4.4 Reliability
- Invoice numbering must be 100% accurate (no duplicates)
- PDF generation must succeed or fail gracefully with error message
- Bot must handle unexpected user input without crashing

### 4.5 Usability
- Bot conversation flow intuitive for non-technical users
- Error messages clear and actionable
- PDF readable on all devices (mobile, desktop, print)

---

## 5. Technical Architecture

### 5.1 Technology Stack

**Frontend/PDF Service:**
- Framework: Next.js 14+
- PDF Library: react-pdf / Puppeteer / jsPDF
- Hosting: Vercel (Free Tier)

**Backend:**
- Database & API: Convex (Free Tier)
- Real-time updates: Convex subscriptions

**Bot:**
- Platform: Telegram Bot API
- Library: node-telegram-bot-api / Grammy
- Hosting: Vercel Serverless Functions

**Data Source:**
- Google Sheets API (read-only)

**All Free Services:**
- ✅ Vercel Free: 100GB bandwidth/month
- ✅ Convex Free: 1GB storage, unlimited requests
- ✅ Telegram: Unlimited messages
- ✅ Google Sheets API: 300 requests/minute

### 5.2 System Architecture Diagram

```
┌─────────────────┐
│  Google Sheets  │ (Product Database)
│  (Manual Edit)  │
└────────┬────────┘
         │ Sync (On-demand / Periodic)
         ↓
┌─────────────────────────────────────────┐
│            CONVEX (Backend)             │
│  ┌─────────────────────────────────┐   │
│  │  Database:                      │   │
│  │  - products                     │   │
│  │  - invoices                     │   │
│  │  - invoiceCounter               │   │
│  │  - systemConfig                 │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  Functions:                     │   │
│  │  - Product search               │   │
│  │  - Invoice creation             │   │
│  │  - Counter management           │   │
│  └─────────────────────────────────┘   │
└────────┬────────────────────┬───────────┘
         │                    │
         ↓                    ↓
┌────────────────┐   ┌────────────────────┐
│ Telegram Bot   │   │  Next.js (Vercel)  │
│                │   │                    │
│ User Interface │←──│  PDF Generation    │
│ (Conversation) │   │  API Endpoint      │
└────────────────┘   └────────────────────┘
         ↑
         │
    ┌────────┐
    │  User  │ (Business Owner via Telegram)
    └────────┘
```

### 5.3 Data Flow

**Invoice Generation Flow:**
1. User sends customer info to Telegram bot
2. Bot stores data temporarily in conversation state
3. User sends product names
4. Bot queries Convex for product search
5. Convex returns matching products
6. User confirms quantities and prices
7. Bot sends invoice data to Convex
8. Convex creates invoice record with auto-generated number
9. Convex triggers Vercel PDF generation API
10. Vercel generates PDF and returns buffer
11. Bot receives PDF and sends to user
12. Invoice saved in Convex database

---

## 6. Development Phases

**Note:** This project is designed to be built iteratively by AI coding agents. Each phase can be completed independently and tested before moving to the next.

### Phase 1: Foundation & Data Layer
**Goal:** Setup infrastructure and core data layer

**Priority:** P0 (Must complete first)

**Prerequisites - User Configuration Required:**

Before starting this phase, the agent will prompt the user for:

1. **Google Sheets Setup:**
   ```
   AGENT PROMPT: "Please provide your Google Sheet details:
   1. Google Sheet ID or full URL
   2. Google Sheets API credentials (API Key or Service Account JSON)
   3. Confirm your sheet structure matches:
      - Column A: Product Name
      - Column B: Color/Variant  
      - Column C: Warranty
      - Column D: Category
      - Column E: Selling Price (BDT numbers only)"
   ```

2. **Convex Setup:**
   ```
   AGENT PROMPT: "I'll now set up Convex for you. 
   Do you already have a Convex account? (yes/no)
   - If yes: Please provide your Convex project name/URL
   - If no: I'll create a new account and project"
   ```

**Tasks:**
1. [ ] Initialize Convex project (`npx convex dev`)
2. [ ] Define database schema (products, invoices, invoiceCounter, systemConfig)
3. [ ] Create Convex functions:
   - Query: `products.list()`, `products.search(query)`
   - Mutation: `products.syncFromGoogleSheets()`, `invoices.create(data)`
   - Action: `invoiceCounter.getNext()` with atomic increment
4. [ ] Implement Google Sheets sync logic using provided credentials
5. [ ] Test invoice counter (including month rollover)
6. [ ] Create initial systemConfig entry for VAT rate (15%)

**Success Criteria:**
- ✅ Convex project initialized and deployed
- ✅ Schema defined and validated
- ✅ Google Sheets sync working (can fetch products from user's sheet)
- ✅ Invoice counter generates correct YYYYMM### format
- ✅ No duplicate invoice numbers possible
- ✅ VAT rate configured in systemConfig

**AI Agent Notes:**
- Use Convex CLI for initialization: `npx convex dev`
- Schema file: `convex/schema.ts`
- Functions in separate files: `convex/products.ts`, `convex/invoices.ts`
- Test counter edge case: month boundary (e.g., 202601999 → 202602001)
- Store Google Sheets credentials securely in Convex environment variables
- Phone number validation regex for Bangladesh: `/^01[0-9]{9}$/` (11 digits starting with 01)

**User Prompts During Phase:**
- If Google Sheets sync fails: "Unable to access your Google Sheet. Please verify:
  1. Sheet ID is correct
  2. API credentials are valid
  3. Sheet is shared with service account (if using service account)
  Would you like to provide updated credentials?"

---

### Phase 2: PDF Generation Service
**Goal:** Create invoice PDF template and generation API

**Priority:** P0 (Can be built in parallel with Phase 1)

**Prerequisites - User Configuration Required:**

Before starting this phase, the agent will prompt the user for:

1. **Company Information:**
   ```
   AGENT PROMPT: "Please provide your company/business details for the invoice:
   1. Company Name: _______________
   2. Company Address (Bangladesh): _______________
   3. Company Email: _______________
   4. Company Phone: _______________
   5. BIN/Trade License Number: _______________
   6. Company Logo (optional): 
      - Upload image file, OR
      - Provide URL to logo image, OR
      - Skip for now (will use text-only header)
   7. Payment Details for invoice footer:
      - bKash: _______________
      - Nagad: _______________
      - Bank Account: _______________
   8. Invoice Terms & Conditions (optional): _______________"
   ```

2. **Invoice Design Reference:**
   ```
   AGENT PROMPT: "Do you have an existing Word invoice template?
   - If yes: Please upload the .docx file so I can match the design
   - If no: I'll create a professional standard invoice design"
   ```

**Tasks:**
1. [ ] Initialize Next.js project (`npx create-next-app@latest`)
2. [ ] Install PDF library (`npm install puppeteer` or `@react-pdf/renderer`)
3. [ ] Create invoice template component with user's company info
   - Use provided design specifications (Section 3.3.1)
   - If Word template provided, match its layout exactly
   - Use company logo if provided
   - Style with TailwindCSS or inline CSS
4. [ ] Create API route: `/api/generate-invoice-pdf`
   - Accept POST request with invoice data
   - Generate PDF from template
   - Return PDF buffer
5. [ ] Test with sample invoice data
6. [ ] Deploy to Vercel (`vercel --prod`)

**Success Criteria:**
- ✅ Next.js app running locally
- ✅ PDF generates from sample data
- ✅ PDF includes correct company information
- ✅ PDF matches design requirements (or Word template if provided)
- ✅ Currency formatted as ৳1,29,900 (BDT with thousands separator)
- ✅ VAT calculated at 15%
- ✅ API endpoint returns PDF buffer
- ✅ Deployed to Vercel and accessible via URL

**AI Agent Notes:**
- File structure:
  ```
  /app/api/generate-invoice-pdf/route.ts
  /components/InvoiceTemplate.tsx
  /lib/pdfGenerator.ts
  /lib/companyConfig.ts (store company info)
  ```
- Use environment variables for company info in production
- PDF should be generated server-side (not client-side)
- Test endpoint with curl or Postman before bot integration
- If logo provided, validate image format (PNG/JPG) and size (<500KB)
- Default footer message: "Thank you for your business!" if not provided

**Sample Test Request:**
```bash
curl -X POST https://your-app.vercel.app/api/generate-invoice-pdf \
  -H "Content-Type: application/json" \
  -d '{"invoiceNumber":"202601001","customerName":"Rahul Ahmed",...}'
```

**User Prompts During Phase:**
- If logo upload fails: "Logo file too large or invalid format. Please provide:
  1. PNG or JPG image under 500KB, OR
  2. URL to hosted logo, OR  
  3. Skip logo for text-only header"
- After first PDF generated: "Please review the generated invoice PDF. Does it match your requirements? (yes/no)
  - If no: What changes are needed? (design, layout, formatting, etc.)"

---

### Phase 3: Telegram Bot
**Goal:** Build conversational bot interface

**Priority:** P0 (Depends on Phase 1 and 2)

**Prerequisites - User Configuration Required:**

Before starting this phase, the agent will prompt the user for:

1. **Telegram Bot Setup:**
   ```
   AGENT PROMPT: "Please create a Telegram bot and provide:
   
   Step 1: Create Bot
   - Open Telegram and search for '@BotFather'
   - Send /newbot command
   - Choose bot name (e.g., 'MyStore Invoice Bot')
   - Choose username (e.g., 'mystoreinvoice_bot')
   - Copy the bot token provided
   
   Step 2: Get Your Telegram User ID
   - Send /start to @userinfobot
   - Copy your user ID
   
   Please provide:
   1. Bot Token: _______________
   2. Your Telegram User ID: _______________
   
   (The bot will only respond to your Telegram account for security)"
   ```

**Tasks:**
1. [ ] Verify bot token is valid (test connection)
2. [ ] Initialize bot project (integrate with Next.js or separate)
   - Install: `npm install node-telegram-bot-api` or `grammy`
3. [ ] Implement conversation state machine
   - States: AWAITING_CUSTOMER_INFO, AWAITING_PRODUCTS, AWAITING_QUANTITY, AWAITING_CONFIRMATION
   - Store state per user in memory (Map) or Convex
4. [ ] Implement message handlers:
   - Customer info parsing (regex for comma/newline)
   - Phone validation (Bangladesh format: 01XXXXXXXXX)
   - Product search (call Convex `products.search()`)
   - Quantity input parsing
   - Price editing parsing
   - Confirmation trigger
5. [ ] Integrate invoice generation flow:
   - Call Convex `invoices.create()`
   - Call Vercel PDF API
   - Send PDF file to user
6. [ ] Implement user access control (only respond to authorized user ID)
7. [ ] Deploy bot (Vercel serverless function with webhook OR long-polling)

**Success Criteria:**
- ✅ Bot responds to messages from authorized user only
- ✅ Bot ignores messages from unauthorized users
- ✅ Complete conversation flow works end-to-end
- ✅ Customer info parsed correctly (both comma and newline formats)
- ✅ Phone number validation works (Bangladesh format)
- ✅ Product search returns matches from Convex
- ✅ PDF generated and sent to user
- ✅ Invoice saved in Convex with correct invoice number

**AI Agent Notes:**
- Bot can run as Vercel serverless function with webhook
- Or use long-polling for simpler setup (no webhook needed)
- Store conversation state in memory for MVP (lost on restart, acceptable)
- Use regex patterns:
  ```javascript
  // Comma-separated: "Name, Address, Phone"
  const regex = /^([^,]+),\s*([^,]+),\s*(.+)$/
  
  // Line-separated: "Name\nAddress\nPhone"
  const lines = message.split('\n')
  
  // Bangladesh phone validation: 01XXXXXXXXX (11 digits)
  const phoneRegex = /^01[0-9]{9}$/
  ```
- Test each handler separately before integrating
- Add welcome message when user first starts bot
- Add /help command to show format examples

**Example Bot Structure:**
```
/app/api/telegram-webhook/route.ts  (if using webhook)
or
/bot/index.ts  (if using long-polling)
/bot/handlers/customerInfo.ts
/bot/handlers/productSearch.ts
/bot/handlers/confirmation.ts
/bot/utils/stateManager.ts
/bot/utils/accessControl.ts
```

**User Prompts During Phase:**
- After bot setup: "Bot is ready! Please test it:
  1. Open Telegram and search for your bot: @[username]
  2. Send /start to begin
  3. Try generating a test invoice
  
  Does the bot respond? (yes/no)"
  
- If bot doesn't respond: "Bot connection issue. Please verify:
  1. Bot token is correct
  2. Bot is not blocked
  3. You're using the correct Telegram account
  Would you like to provide a new bot token?"

---

### Phase 4: Integration & Testing
**Goal:** End-to-end testing and refinement

**Priority:** P1 (After all phases complete)

**Tasks:**
1. [ ] End-to-end test: Generate invoice via bot
2. [ ] Test edge cases:
   - Invalid customer info format
   - Product not found
   - Month boundary invoice numbering
   - Bot restart (state loss)
3. [ ] Performance testing:
   - Measure response times
   - Check PDF generation time
4. [ ] Fix bugs found during testing
5. [ ] Add error handling and user-friendly messages
6. [ ] Documentation:
   - User guide (how to use bot)
   - Admin guide (how to update Google Sheets)
   - Deployment guide

**Success Criteria:**
- ✅ All acceptance criteria met (Section 12)
- ✅ No critical bugs
- ✅ Error messages are clear and helpful
- ✅ Documentation complete

**AI Agent Notes:**
- Create test scenarios document
- Use sample data from Section 13.1
- Test with real Google Sheet (not mock data)
- Verify invoice PDF matches Word template exactly

---

### AI Agent Development Tips

**Order of Development:**
1. **Start with Phase 1** (Convex backend) - This is the foundation
2. **Then Phase 2** (PDF generation) - Can test independently with mock data
3. **Then Phase 3** (Telegram bot) - Integrates everything
4. **Finally Phase 4** (Testing) - Validate entire system

**Incremental Testing:**
- Test each Convex function individually before integration
- Test PDF generation with hardcoded data before connecting to Convex
- Test bot message parsing before connecting to backend
- Build and test one conversation state at a time

**Recommended Approach:**
- Use `console.log()` extensively for debugging
- Deploy early and often (Convex has instant deployment)
- Test in production environment (Telegram bot requires webhook URL)
- Keep functions small and focused (easier for AI to generate correctly)

**Common Pitfalls to Avoid:**
- ❌ Don't build everything at once
- ❌ Don't skip testing individual components
- ❌ Don't forget to handle errors
- ❌ Don't use complex state management for MVP
- ✅ Do build incrementally
- ✅ Do test each piece before integration
- ✅ Do use simple solutions (in-memory state is fine for MVP)
- ✅ Do add logging for debugging

---

## 7. Testing Strategy

### 7.1 Unit Tests
- Invoice counter logic (month rollover)
- Customer info parsing (comma vs line-break)
- Product fuzzy search
- Price calculation (subtotal, tax, total)

### 7.2 Integration Tests
- Google Sheets to Convex sync
- Convex to PDF generation API
- Bot to Convex queries
- PDF delivery to Telegram

### 7.3 End-to-End Tests
- Complete invoice generation flow
- Multiple invoices in sequence
- Month rollover scenario
- Error handling scenarios

### 7.4 User Acceptance Testing
- Business owner tests real scenarios
- Verify PDF matches existing Word template
- Verify invoice numbering accuracy
- Verify workflow is faster than manual process

---

## 8. Deployment Plan

### 8.1 Prerequisites
- Convex account created
- Vercel account created
- Google Cloud project with Sheets API enabled
- Telegram bot created (via BotFather)

### 8.2 Deployment Steps

**Step 1: Deploy Convex**
```bash
npx convex deploy --prod
```

**Step 2: Deploy Next.js to Vercel**
```bash
vercel --prod
```

**Step 3: Configure Telegram Bot**
- Set webhook URL to Vercel endpoint
- Test bot connection

**Step 4: Sync Initial Product Data**
- Run Google Sheets sync function
- Verify products in Convex dashboard

**Step 5: Generate Test Invoice**
- Send test data to bot
- Verify PDF generation
- Verify invoice number format

### 8.3 Environment Variables

**Convex:**
- `GOOGLE_SHEETS_API_KEY`
- `GOOGLE_SHEET_ID`

**Vercel:**
- `CONVEX_DEPLOYMENT_URL`
- `TELEGRAM_BOT_TOKEN`
- `CONVEX_DEPLOY_KEY`

---

## 9. User Documentation

### 9.1 How to Generate an Invoice (User Guide)

**Step 1: Send Customer Information**
```
Format: Name, Address, Phone
Example: Rahul Ahmed, Dhanmondi Road 27 Dhaka 1209, 01712345678
```

**Step 2: Send Product Names**
```
Format: Product1, Product2
Example: iPhone 15, AirPods Pro
```

**Step 3: Confirm or Edit Quantities**
```
Format: 1=2, 2=1
Or reply: OK (for default quantity 1)
```

**Step 4: Confirm or Edit Prices**
```
Format: 1 125000 (to change product 1 price)
Or reply: OK (to confirm)
```

**Step 5: Receive Invoice**
```
Download PDF and share with customer
```

### 9.2 How to Update Product Prices

1. Open Google Sheet
2. Edit selling price in Column E
3. Save changes
4. Products will sync automatically within 5 minutes
5. New invoices will use updated prices

### 9.3 Troubleshooting

**Problem:** Bot not responding
- **Solution:** Check if bot is running, restart if needed

**Problem:** Product not found
- **Solution:** Check spelling, try partial name (e.g., "iPhone" instead of "iPhone 15 Pro")

**Problem:** PDF not generating
- **Solution:** Check Vercel deployment status, check error logs

**Problem:** Wrong invoice number
- **Solution:** Check Convex database, verify counter logic

---

## 10. Future Enhancements (Post-MVP)

### Phase 2 Features:
- **Multi-user support** (multiple sales reps)
- **Customer database** (save customer info for repeat customers)
- **Invoice history search** (by customer name, date, invoice number)
- **Email invoice** (send PDF via email directly)
- **WhatsApp integration** (alternative to Telegram)
- **Payment tracking** (paid/unpaid status)
- **Analytics dashboard** (sales reports, revenue trends)

### Phase 3 Features:
- **Inventory management** (stock tracking)
- **Purchase orders** (supplier management)
- **Profit margin calculator**
- **GST filing reports**
- **Mobile app** (native iOS/Android)

---

## 11. Risk Assessment

### 11.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Invoice number collision | High | Low | Implement atomic counter with database locks |
| PDF generation failure | High | Medium | Add retry logic, fallback to simple text invoice |
| Google Sheets API rate limit | Medium | Low | Cache products locally, sync periodically |
| Telegram bot downtime | High | Low | Deploy on reliable platform (Vercel), monitor uptime |
| Vercel free tier limits exceeded | Medium | Low | Monitor usage, upgrade if needed |

### 11.2 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| User finds bot interface confusing | High | Medium | Conduct user testing, iterate on conversation flow |
| PDF design doesn't match Word template | Medium | Medium | Review with stakeholder before launch |
| System too slow for business needs | Medium | Low | Optimize performance, test with realistic load |

---

## 12. Acceptance Criteria (Final Checklist)

### 12.1 Core Functionality
- [ ] Invoice generation completes in < 2 minutes
- [ ] Invoice numbering follows YYYYMM### format
- [ ] Invoice counter resets monthly
- [ ] No duplicate invoice numbers
- [ ] PDF matches existing Word template design
- [ ] All invoice fields populated correctly

### 12.2 Telegram Bot
- [ ] Bot responds to messages within 3 seconds
- [ ] Bot parses comma-separated customer info
- [ ] Bot parses line-separated customer info
- [ ] Bot performs fuzzy product search
- [ ] Bot displays product details correctly
- [ ] Bot allows quantity editing
- [ ] Bot allows price editing
- [ ] Bot sends PDF to user successfully
- [ ] Bot handles errors gracefully

### 12.3 Data Integration
- [ ] Products sync from Google Sheets
- [ ] Product prices update within 5 minutes of Sheet edit
- [ ] Invoice data saved to Convex
- [ ] Invoice history retrievable

### 12.4 PDF Quality
- [ ] PDF opens in all standard PDF readers
- [ ] PDF is print-ready (A4 size)
- [ ] Text is readable and properly formatted
- [ ] Currency formatting correct (₹1,29,900)
- [ ] Tables aligned properly

### 12.5 Deployment
- [ ] Convex deployed and accessible
- [ ] Next.js deployed to Vercel
- [ ] Telegram bot configured and running
- [ ] All environment variables set
- [ ] Initial product data synced

---

## 13. Appendix

### 13.1 Sample Invoice Data

**Customer:**
- Name: Rahul Ahmed
- Address: Dhanmondi Road 27, Dhaka 1209
- Phone: 01712345678

**Products:**
- iPhone 15 Pro (Space Black, 1 Year Warranty) x2 @ ৳1,29,900
- AirPods Pro 2nd Gen (White, 1 Year Warranty) x1 @ ৳24,900

**Calculations:**
- Subtotal: ৳2,84,700
- VAT (15%): ৳42,705
- Total: ৳3,27,405

**Invoice Number:** 202601015  
**Date:** January 28, 2026

### 13.2 Bot Commands (Optional)

- `/start` - Start the bot and see welcome message
- `/new` - Start new invoice
- `/cancel` - Cancel current invoice and start over
- `/help` - Show help message with format examples
- `/history` - Show recent invoices (future feature)

### 13.3 Glossary

- **MVP:** Minimum Viable Product
- **VAT:** Value Added Tax (15% standard rate in Bangladesh)
- **BIN:** Business Identification Number (Bangladesh tax identifier)
- **Fuzzy Search:** Approximate string matching (e.g., "iPhone" matches "iPhone 15 Pro")
- **Webhook:** Automated HTTP callback for real-time updates
- **API:** Application Programming Interface

---

## 14. Sign-off

### 14.1 Stakeholder Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | [Business Owner Name] | _________ | ______ |
| Developer | [Developer Name] | _________ | ______ |

### 14.2 Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jan 28, 2026 | Initial PRD creation | Claude |

---

**End of Document**
