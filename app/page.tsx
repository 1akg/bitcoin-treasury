'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Page() {
  const [ticker] = useState("1AKG");
  const [holding, setHolding] = useState<number>(0);
  const [usdPrice, setUsdPrice] = useState<number>(0);
  const [cadPrice, setCadPrice] = useState<number>(0);
  const address = "bc1q6920ksguf766wye08azalqfk9f426nqn3xx73r";

  useEffect(() => {
    const fetchBitcoinBalance = async () => {
      try {
        const response = await fetch(`https://blockstream.info/api/address/${address}`);
        const balanceData = await response.json();
        const btcBalance = (balanceData.chain_stats.funded_txo_sum - balanceData.chain_stats.spent_txo_sum) / 1e8;
        setHolding(btcBalance);
      } catch (error) {
        console.error('Error fetching Bitcoin balance:', error);
      }
    };

    const fetchPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,cad');
        const data = await response.json();
        setUsdPrice(data.bitcoin.usd);
        setCadPrice(data.bitcoin.cad);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    fetchBitcoinBalance();
    fetchPrices();

    // Fetch balance and prices every 5 minutes
    const balanceInterval = setInterval(fetchBitcoinBalance, 5 * 60 * 1000);
    const pricesInterval = setInterval(fetchPrices, 5 * 60 * 1000);

    return () => {
      clearInterval(balanceInterval);
      clearInterval(pricesInterval);
    };
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Image */}
      <div className="fixed inset-0 w-full h-full">
        <Image
          src="/images/bitcoin-speaker.jpg"
          alt="Bitcoin Speaker Background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-black/70 rounded-xl p-8 backdrop-blur-sm">
          <h1 className="text-4xl font-bold mb-8 text-white text-center">{ticker} Bitcoin Holdings</h1>
          <div className="space-y-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {holding.toFixed(5)} BTC
            </div>
            <div className="text-2xl text-gray-200">
              ≈ {formatCurrency(holding * usdPrice).replace('$', 'US$')}
            </div>
            <div className="text-2xl text-gray-200">
              ≈ {formatCurrency(holding * cadPrice).replace('$', 'CA$')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
