# TechyfyApp Deployment Guide

## Current Status

✅ **Convex Backend**: Successfully deployed to https://your-convex-deployment.convex.cloud
⏳ **Next.js Frontend**: Ready to deploy to Vercel
⏳ **Environment Variables**: Need to be configured in Vercel

## Step 1: Deploy to Vercel

1. **Go to Vercel**
   - Visit https://vercel.com and log in with your GitHub account

2. **Import Your Repository**
   - Click "Add New..." and select "Project"
   - Find and select your "TechyfyApp" repository from the list
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Next.js
   - **Root Directory**: `convex-backend/my-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   Go to "Environment Variables" section and add these variables:
   ```
   NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
   CONVEX_DEPLOYMENT=your-convex-deployment-id
   ```
   Add any other environment variables your application needs from your `.env.local` file

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

## Step 2: Connect Telegram Bot (Optional)

After deployment, you can connect your Telegram bot:

1. Get your Vercel deployment URL from the Vercel dashboard
2. Set the webhook by calling:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-vercel-app-url.vercel.app/api/telegram-webhook
   ```

## Step 3: Test the Application

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

- **Convex Dashboard**: https://dashboard.convex.dev/
- **Next.js App**: https://your-app-name.vercel.app/
- **PDF API**: https://your-app-name.vercel.app/api/generate-invoice-pdf
- **Telegram Webhook**: https://your-app-name.vercel.app/api/telegram-webhook

## Troubleshooting

### Common Issues:

1. **Vercel Deployment Fails**: Check your Vercel authentication and project settings
2. **Environment Variables Not Working**: Make sure all variables are correctly set in Vercel
3. **Convex Connection Issues**: Verify the deployment URL is correct and accessible
4. **Telegram Bot Not Responding**: 
   - Verify bot token is correct
   - Check webhook URL is accessible
   - Make sure your user ID is set correctly for access control

### Environment Variable Issues:

1. **Variables Not Loading**: Make sure your environment variables are set in Vercel dashboard
2. **Convex Connection Issues**: Verify that `NEXT_PUBLIC_CONVEX_URL` is set to your actual Convex deployment URL

## Security Notes

1. Never commit your `.env.local` file to version control
2. Use environment-specific variables for different deployment stages
3. Regularly rotate your Telegram bot token
4. Implement proper access control for the Telegram bot (user ID verification)

## Next Steps

1. Deploy to Vercel using the steps above
2. Test the application using the provided curl commands
3. Connect your Telegram bot if needed
4. Start using your invoice generation system!