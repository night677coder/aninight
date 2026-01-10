import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const envVars = {
    API_URI: process.env.API_URI,
    ZORO_URI: process.env.ZORO_URI,
    NEXT_PUBLIC_PROXY_URI: process.env.NEXT_PUBLIC_PROXY_URI,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    ANIMEPAHE_BASE_URL: process.env.ANIMEPAHE_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV
  };

  console.log('[DEBUG] Environment variables:', envVars);
  
  return NextResponse.json({
    message: "Environment variables check",
    environment: envVars,
    timestamp: new Date().toISOString()
  });
}
