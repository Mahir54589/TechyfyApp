#!/bin/bash

echo "Deploying to Vercel..."

# Deploy to Vercel
npx vercel --prod

echo "Vercel deployment complete!"
echo "Your app is now live at:"
npx vercel ls