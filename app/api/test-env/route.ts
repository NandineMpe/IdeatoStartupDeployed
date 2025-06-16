import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '*** (exists)' : 'Not set',
    // Add other environment variables you want to check
  };

  return NextResponse.json({
    success: true,
    environment: process.env.NODE_ENV,
    envVars,
    note: 'This is a test endpoint to verify environment variables. In production, make sure to secure this endpoint.'
  });
}
