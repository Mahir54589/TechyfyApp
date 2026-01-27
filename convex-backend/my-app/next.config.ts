import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development
  reactStrictMode: true,
  
  // Configure images
  images: {
    unoptimized: true,
  },
  
  // Environment variables that should be available at build time
  env: {
    COMPANY_NAME: process.env.COMPANY_NAME,
    COMPANY_ADDRESS: process.env.COMPANY_ADDRESS,
    COMPANY_EMAIL: process.env.COMPANY_EMAIL,
    COMPANY_PHONE: process.env.COMPANY_PHONE,
    COMPANY_BIN: process.env.COMPANY_BIN,
    COMPANY_LOGO_URL: process.env.COMPANY_LOGO_URL,
    PAYMENT_BKASH: process.env.PAYMENT_BKASH,
    PAYMENT_NAGAD: process.env.PAYMENT_NAGAD,
    PAYMENT_BANK: process.env.PAYMENT_BANK,
    INVOICE_TERMS: process.env.INVOICE_TERMS,
  },
  
  // API configuration
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
