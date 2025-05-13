import { NextRequest } from 'next/server';

let cachedBalances: Record<string, number> = {};
let lastFetch: Record<string, number> = {};
const CACHE_DURATION = 60 * 1000; // 60 seconds

async function fetchWalletBalance(address: string): Promise<number> {
  const now = Date.now();
  if (cachedBalances[address] && now - (lastFetch[address] || 0) < CACHE_DURATION) {
    return cachedBalances[address];
  }
  try {
    const response = await fetch(`https://blockstream.info/api/address/${address}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const balanceData = await response.json();
    const confirmedBalance = (balanceData.chain_stats.funded_txo_sum - balanceData.chain_stats.spent_txo_sum) / 1e8;
    const unconfirmedBalance = (balanceData.mempool_stats.funded_txo_sum - balanceData.mempool_stats.spent_txo_sum) / 1e8;
    const total = confirmedBalance + unconfirmedBalance;
    cachedBalances[address] = total;
    lastFetch[address] = now;
    return total;
  } catch (error) {
    return 0;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const addresses = searchParams.getAll('address');
  if (!addresses.length) {
    return new Response(JSON.stringify({ error: 'No addresses provided' }), { status: 400 });
  }
  const balances = await Promise.all(addresses.map(fetchWalletBalance));
  const total = balances.reduce((sum, b) => sum + b, 0);
  return new Response(JSON.stringify({ total, balances: Object.fromEntries(addresses.map((a, i) => [a, balances[i]])) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
} 