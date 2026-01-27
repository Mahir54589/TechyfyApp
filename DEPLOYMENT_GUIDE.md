# TechyfyApp Deployment Guide

## Overview

This is an Invoice Generation System with Telegram Bot integration. The system consists of:
- **Convex Backend**: Database, API, and business logic
- **Next.js Frontend**: Web dashboard and PDF generation API
- **Telegram Bot**: Conversational interface for generating invoices

## Prerequisites

Before deploying, ensure you have:
1. A [Convex](https://convex.dev) account
2. A [Vercel](https://vercel.com) account
3. A [Telegram](https://telegram.org) account
4. Google Cloud project with Sheets API enabled (optional, for product sync)

## Environment Variables

Create a `.env.local` file in `convex-backend/my-app/` with the following variables:

```bash
# Convex Configuration (from Convex Dashboard)
CONVEX_DEPLOYMENT=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_USER_ID=your-telegram-user-id

# PDF Generation API URL (your Vercel deployment URL)
# This will be set after first Vercel deployment, or use localhost for testing
PDF_API_URL=https://your-app.vercel.app/api/generate-invoice-pdf

# Google Sheets Configuration (optional)
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----"
GOOGLE_SHEET_ID=your-google-sheet-id

# Company Information (for invoices)
COMPANY_NAME=Your Company Name
COMPANY_ADDRESS=Your Address, Dhaka, Bangladesh
COMPANY_EMAIL=contact@yourcompany.com
COMPANY_PHONE=+880 1XXX XXXXXX
COMPANY_BIN=BIN: 123456789012

# Payment Details
PAYMENT_BKASH=017XXXXXXXX
PAYMENT_NAGAD=017XXXXXXXX
PAYMENT_BANK="Account Name: Your Company, Account Number: XXXXXXXX, Bank: XYZ Bank"
```

## Step 1: Setup Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Choose a name (e.g., "MyStore Invoice Bot")
4. Choose a username (e.g., `mystoreinvoice_bot`)
5. Copy the bot token provided
6. Send `/start` to `@userinfobot` to get your User ID
7. Update `TELEGRAM_BOT_TOKEN` and `TELEGRAM_USER_ID` in your environment variables

## Step 2: Deploy Convex Backend

```bash
cd convex-backend/my-app

# Install dependencies
npm install

# Login to Convex (if not already logged in)
npx convex login

# Deploy to Convex
npx convex deploy

# Note the deployment URL from the output
```

## Step 3: Deploy to Vercel

### Option A: Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Note the deployment URL
```

### Option B: Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and log in
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `convex-backend/my-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add all environment variables from `.env.local`
6. Click "Deploy"

## Step 4: Update PDF_API_URL

After getting your Vercel deployment URL, update the `PDF_API_URL` environment variable:

```bash
# In Convex Dashboard
# Go to Settings > Environment Variables
# Add: PDF_API_URL = https://your-app.vercel.app/api/generate-invoice-pdf

# In Vercel Dashboard
# Go to Project Settings > Environment Variables
# Add: PDF_API_URL = https://your-app.vercel.app/api/generate-invoice-pdf
```

## Step 5: Configure Telegram Webhook

Set the webhook URL for your bot:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.vercel.app/api/telegram-webhook",
    "allowed_updates": ["message"]
  }'
```

Or visit this URL in your browser:
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-app.vercel.app/api/telegram-webhook
```

## Step 6: Initialize System

1. Visit your Vercel app URL
2. Click "Initialize System" to set up default configuration
3. Click "Sync with Google Sheets" (if configured) or add products manually

## Testing

### Test PDF Generation

```bash
curl -X POST https://your-app.vercel.app/api/generate-invoice-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceNumber": "202601001",
    "date": "2026-01-28",
    "customerName": "Test Customer",
    "customerAddress": "Test Address, Dhaka 1209",
    "customerPhone": "01712345678",
    "items": [
      {
        "productName": "iPhone 15 Pro",
        "color": "Space Black",
        "warranty": "1 Year",
        "quantity": 1,
        "unitPrice": 129900,
        "amount": 129900
      }
    ],
    "subtotal": 129900,
    "taxRate": 0.15,
    "taxAmount": 19485,
    "total": 149385
  }' \
  --output test-invoice.pdf
```

### Test Telegram Bot

1. Open Telegram and find your bot
2. Send `/start`
3. Follow the conversation flow:
   - Enter customer info: `Rahul Ahmed, Dhanmondi Road 27, Dhaka 1209, 01712345678`
   - Enter products: `iPhone, AirPods`
   - Enter quantities: `OK` or `1=2, 2=1`
   - Confirm: `OK`
4. You should receive a PDF invoice

## Troubleshooting

### Bot Not Responding

1. Check webhook is set correctly:
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
   ```
2. Verify `TELEGRAM_BOT_TOKEN` is correct
3. Check Vercel logs for errors

### PDF Generation Fails

1. Check `PDF_API_URL` is set correctly in Convex
2. Verify all required environment variables are set
3. Check Vercel function logs

### Google Sheets Sync Fails

1. Verify service account has access to the sheet
2. Check `GOOGLE_SHEETS_CLIENT_EMAIL` and `GOOGLE_SHEETS_PRIVATE_KEY`
3. Ensure Google Sheets API is enabled in Google Cloud Console

### Invoice Number Duplicates

The system now uses atomic operations to prevent duplicates. If you see duplicates:
1. Check Convex logs for race condition warnings
2. Verify only one instance of the app is running

## Security Considerations

1. **Never commit `.env.local` to git**
2. Regularly rotate your Telegram bot token
3. Use strong private keys for Google Sheets
4. The bot only responds to the authorized `TELEGRAM_USER_ID`
5. All API endpoints have CORS configured

## Maintenance

### Updating the App

```bash
# Pull latest changes
git pull

# Update dependencies
cd convex-backend/my-app
npm install

# Deploy Convex
npx convex deploy

# Deploy Vercel
vercel --prod
```

### Backing Up Data

Use Convex's built-in export feature or create a backup action:
```bash
npx convex export --path ./backup
```

## Support

For issues or questions:
1. Check the logs in Vercel and Convex dashboards
2. Review the PRD.md for feature specifications
3. Check environment variable configuration
