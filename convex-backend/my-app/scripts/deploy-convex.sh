#!/bin/bash

echo "Deploying Convex to production..."

# Deploy Convex functions
npx convex deploy --prod

echo "Convex deployment complete!"
echo "Your Convex deployment URL is:"
npx convex deploy --prod-url