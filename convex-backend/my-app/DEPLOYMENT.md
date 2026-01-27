# Invoice Generation Webapp - Deployment Guide

This guide explains how to deploy the Invoice Generation Webapp with Telegram Bot Integration.

## Prerequisites

Before deploying, make sure you have:

1. **Convex Account**: Create a free account at [convex.dev](https://convex.dev)
2. **Vercel Account**: Create a free account at [vercel.com](https://vercel.com)
3. **Telegram Bot**: Create a bot using [@BotFather](https://t.me/BotFather) in Telegram
4. **Google Sheets API**: Enable Google Sheets API and create credentials (optional for MVP)

## Environment Variables

You need to set the following environment variables:

### For Convex:
- `CONVEX_DEPLOYMENT`: Your Convex deployment URL (e.g., `https://glorious-hornet-435.convex.cloud`)

### For Vercel:
- `NEXT_PUBLIC_CONVEX_URL`: Your Convex deployment URL
- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token from BotFather
- `TELEGRAM_USER_ID`: Your Telegram user ID (get from @userinfobot)

## Deployment Steps

### 1. Deploy Convex Backend

```bash
cd convex-backend/my-app
npm run deploy:convex
```

This will deploy your Convex functions and provide you with the deployment URL.

### 2. Update Environment Variables

1. Copy the Convex deployment URL from the output
2. Update your `.env.local` file with:
   ```
   CONVEX_DEPLOYMENT=your-convex-url
   NEXT_PUBLIC_CONVEX_URL=your-convex-url
   ```

### 3. Deploy to Vercel

```bash
cd convex-backend/my-app
npm run deploy:vercel
```

This will deploy your Next.js application to Vercel and provide you with the deployment URL.

### 4. Configure Telegram Bot Webhook

1. Get your Vercel deployment URL from the output
2. Set the webhook by calling:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-vercel-app-url.vercel.app/api/telegram-webhook
   ```

### 5. Test the Application

1. Start a conversation with your bot in Telegram
2. Try creating a test invoice with the sample products

## Testing

To test the application:

1. **Initialize System**: Send a POST request to `/api/initialize` to add sample products
   ```bash
   curl -X POST https://your-app-url.vercel.app/api/initialize
   ```

2. **Test PDF Generation**: Test the PDF generation endpoint
   ```bash
   curl -X POST https://your-app-url.vercel.app/api/generate-invoice-pdf \
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
     }'
   ```

## Production URLs

After deployment, your application will be available at:

- **Convex Dashboard**: `https://dashboard.convex.dev/`
- **Next.js App**: `https://your-app-name.vercel.app/`
- **PDF API**: `https://your-app-name.vercel.app/api/generate-invoice-pdf`
- **Telegram Webhook**: `https://your-app-name.vercel.app/api/telegram-webhook`

## Troubleshooting

### Common Issues:

1. **Convex Deployment Fails**: Make sure you're logged in to the correct Convex account
2. **Vercel Deployment Fails**: Check your Vercel authentication and project settings
3. **Telegram Bot Not Responding**: 
   - Verify bot token is correct
   - Check webhook URL is accessible
   - Make sure your user ID is set correctly for access control

### Environment Variable Issues:

1. **Variables Not Loading**: Make sure your `.env.local` file is in the correct directory
2. **Convex Connection Issues**: Verify the deployment URL is correct and accessible

## Support

For issues with deployment or functionality:

1. Check the Convex dashboard for function logs
2. Check Vercel logs for deployment issues
3. Review the PRD.md file for detailed requirements

## Security Notes

1. Never commit your `.env.local` file to version control
2. Use environment-specific variables for different deployment stages
3. Regularly rotate your Telegram bot token
4. Implement proper access control for the Telegram bot (user ID verification)