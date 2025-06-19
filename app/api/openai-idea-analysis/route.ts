import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { FULL_ANALYSIS } from './analysis-data';

// Use the full analysis data
const MOCK_RESPONSE = FULL_ANALYSIS;

export async function POST(req: NextRequest) {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, max-age=0',
  };

  // Return mock data with the correct structure
  console.log('Returning mock data');
  return NextResponse.json({ analysis: MOCK_RESPONSE }, { headers });
}
