import { NextRequest } from 'next/server';

let cachedPrice: any = null;
let lastFetch = 0;
const CACHE_DURATION = 60 * 1000; // 60 seconds

export async function GET(req: NextRequest) {
  const now = Date.now();
  if (cachedPrice && now - lastFetch < CACHE_DURATION) {
    return new Response(JSON.stringify(cachedPrice), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,cad');
    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch price' }), { status: 500 });
    }
    const data = await response.json();
    cachedPrice = data;
    lastFetch = now;
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching price' }), { status: 500 });
  }
} 