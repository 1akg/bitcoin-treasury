'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '../components/layout/footer';

interface Metrics {
  btcInTreasury: number;
  totalUnitsOutstanding: number;
  btcYield: number;
  btcNavPerUnitSats: number;
  btcValuePerUnitCAD: number;
  unitCostEquity: number;
  unitCostConvertible: number;
  navPremiumEquity: number;
  navPremiumConvertible: number;
  currentBTCPriceCAD: number;
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wallet addresses
  const satoshiTrialsAddresses = [
    "bc1qpn4tnjt3lecd7t0fsq443hvydmra9ewx0vxxye",
    "bc1q9q3mw5lt566ycv805a74wktm5nansn3p4say23",
    "bc1qgn4fn3l3qqmawakwxyn6tp3ph6tqqtk532msph"
  ];
  const coldReserveAddress = "bc1pwaakwyp5p35a505upwfv7munj0myjrm58jg2n2ef2pyke8uz90ss45w5hr";

  const fetchMetrics = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Fetch current BTC price
      console.log('Fetching BTC price...');
      const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=cad&precision=2');
      if (!priceResponse.ok) {
        throw new Error(`Failed to fetch BTC price: ${priceResponse.statusText}`);
      }
      const priceData = await priceResponse.json();
      console.log('BTC price data:', priceData);
      const currentBTCPriceCAD = priceData.bitcoin.cad;

      // Fetch all transactions
      console.log('Fetching transactions...');
      const allTransactions = [];
      for (const address of [...satoshiTrialsAddresses, coldReserveAddress]) {
        try {
          console.log(`Fetching transactions for address: ${address}`);
          const response = await fetch(`https://mempool.space/api/address/${address}/txs`);
          if (!response.ok) {
            console.warn(`Failed to fetch transactions for ${address}: ${response.statusText}`);
            continue;
          }
          const txs = await response.json();
          console.log(`Found ${txs.length} transactions for ${address}`);
          
          for (const tx of txs) {
            const value = tx.vout.reduce((sum: number, vout: any) => {
              if (vout.scriptpubkey_address === address) {
                return sum + vout.value;
              }
              return sum;
            }, 0);

            if (value > 0) {
              allTransactions.push({
                value,
                address,
                timestamp: tx.status.block_time
              });
            }
          }
        } catch (error) {
          console.warn(`Error processing address ${address}:`, error);
        }
      }

      console.log('Total transactions found:', allTransactions.length);

      // Calculate BTC in Treasury
      const btcInTreasury = allTransactions.reduce((sum, tx) => sum + tx.value, 0) / 1e8;
      console.log('BTC in Treasury:', btcInTreasury);

      // Fixed values from the table
      const totalUnitsOutstanding = 37093780;
      const unitCostEquity = 0.51;
      const unitCostConvertible = 0.65;

      // Calculate derived metrics
      const btcYield = btcInTreasury / totalUnitsOutstanding;
      const btcNavPerUnitSats = btcYield * 100000000;
      const btcValuePerUnitCAD = btcYield * currentBTCPriceCAD;
      const navPremiumEquity = unitCostEquity / btcValuePerUnitCAD;
      const navPremiumConvertible = unitCostConvertible / btcValuePerUnitCAD;

      const metricsData: Metrics = {
        btcInTreasury,
        totalUnitsOutstanding,
        btcYield,
        btcNavPerUnitSats,
        btcValuePerUnitCAD,
        unitCostEquity,
        unitCostConvertible,
        navPremiumEquity,
        navPremiumConvertible,
        currentBTCPriceCAD
      };

      console.log('Calculated metrics:', metricsData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 8): string => {
    return value.toFixed(decimals);
  };

  return (
    <main className="min-h-screen w-full bg-white dark:bg-[#003333] relative overflow-hidden">
      <div 
        className="absolute inset-0 w-screen h-screen bg-cover bg-center bg-no-repeat opacity-50 dark:opacity-30 z-0"
        style={{
          backgroundImage: 'url(/images/canurta-bg.jpg)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
          minWidth: '100vw',
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden'
        }}
      />
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 z-10">
        <div 
          className={`backdrop-blur-sm bg-white/30 dark:bg-[#003333]/30 rounded-xl p-4 sm:p-6 md:p-8 shadow-2xl border border-[#003333]/20 mx-auto transition-all duration-1000 ease-out ${!isLoading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{
            width: 'min(90%, 64rem)',
            maxWidth: '100%'
          }}
        >
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl sm:text-3xl font-light text-[#003333] dark:text-white tracking-wide">
                Canurta Bitcoin Treasury KPIs
              </h1>
              <Link 
                href="/"
                className="text-sm text-[#003333] dark:text-white hover:text-[#004444] dark:hover:text-[#F7FF59] underline decoration-1 underline-offset-4"
              >
                Back to Dashboard
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center text-[#003333] dark:text-white">
                Loading metrics...
              </div>
            ) : error ? (
              <div className="text-center text-red-600 dark:text-red-400">
                Error: {error}
                <button 
                  onClick={fetchMetrics}
                  className="mt-4 block mx-auto px-4 py-2 bg-[#003333] text-white rounded hover:bg-[#004444]"
                >
                  Retry
                </button>
              </div>
            ) : metrics ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#003333]/20">
                      <th className="text-left py-4 px-4 text-[#003333] dark:text-white font-medium">KPI</th>
                      <th className="text-left py-4 px-4 text-[#003333] dark:text-white font-medium">Definition</th>
                      <th className="text-left py-4 px-4 text-[#003333] dark:text-white font-medium">Formula / Basis</th>
                      <th className="text-left py-4 px-4 text-[#003333] dark:text-white font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#003333]/20">
                    <tr>
                      <td className="py-4 px-4 text-[#003333] dark:text-white font-medium">BTC in Treasury</td>
                      <td className="py-4 px-4 text-[#003333]/70 dark:text-white/70">Total amount of Bitcoin held by the company.</td>
                      <td className="py-4 px-4 text-[#003333]/70 dark:text-white/70">Manually reported or verified from cold storage.</td>
                      <td className="py-4 px-4 text-[#003333] dark:text-white">{formatNumber(metrics.btcInTreasury)} BTC</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-[#003333] dark:text-white font-medium">Total Units Outstanding</td>
                      <td className="py-4 px-4 text-[#003333]/70 dark:text-white/70">Assumed Diluted Shares Outstanding: basic units + all convertibles/options/RSUs.</td>
                      <td className="py-4 px-4 text-[#003333]/70 dark:text-white/70">Reported cap table (fully diluted).</td>
                      <td className="py-4 px-4 text-[#003333] dark:text-white">{metrics.totalUnitsOutstanding.toLocaleString()} units</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-[#003333] dark:text-white font-medium">BTC Yield</td>
                      <td className="py-4 px-4 text-[#003333]/70 dark:text-white/70">Bitcoin held per unit of the company.</td>
                      <td className="py-4 px-4 text-[#003333]/70 dark:text-white/70">BTC in Treasury / Total Units</td>
                      <td className="py-4 px-4 text-[#003333] dark:text-white">{formatNumber(metrics.btcYield, 10)} BTC per unit</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-[#003333] dark:text-white font-medium">BTC NAV per Unit (sats)</td>
                      <td className="py-4 px-4 text-[#003333]/70 dark:text-white/70">Bitcoin value per unit in satoshis (1 BTC = 100M sats).</td>
                      <td className="py-4 px-4 text-[#003333]/70 dark:text-white/70">BTC Yield × 100,000,000</td>
                      <td className="py-4 px-4 text-[#003333] dark:text-white">{formatNumber(metrics.btcNavPerUnitSats, 2)} sats</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-[#003333] dark:text-white font-medium">BTC Value per Unit (CAD)</td>
                      <td className="py-4 px-4 text-[#003333]/70 dark:text-white/70">CAD value of Bitcoin held per unit of the company.</td>
                      <td className="py-4 px-4 text-[#003333]/70 dark:text-white/70">BTC Yield × BTC Market Price (CAD)</td>
                      <td className="py-4 px-4 text-[#003333] dark:text-white">{formatCurrency(metrics.btcValuePerUnitCAD)}</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-[#003333] dark:text-white font-medium">Unit Cost (Equity)</td>
                      <td className="py-4 px-4 text-[#003333]/70 dark:text-white/70">Price paid per unit in last equity round (CAD).</td>
                      <td className="py-4 px-4 text-[#003333]/70 dark:text-white/70">Latest private sale</td>
                      <td className="py-4 px-4 text-[#003333] dark:text-white">{formatCurrency(metrics.unitCostEquity)}</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-[#003333] dark:text-white font-medium">Unit Cost (Convertible Debt)</td>
                      <td className="py-4 px-4 text-[#003333]/70 dark:text-white/70">Conversion price for latest convertible debt issuance (CAD).</td>
                      <td className="py-4 px-4 text-[#003333]/70 dark:text-white/70">Contractual term</td>
                      <td className="py-4 px-4 text-[#003333] dark:text-white">{formatCurrency(metrics.unitCostConvertible)}</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-[#003333] dark:text-white font-medium">NAV Premium (Equity)</td>
                      <td className="py-4 px-4 text-[#003333]/70 dark:text-white/70">Premium multiple of equity unit price over BTC value per unit.</td>
                      <td className="py-4 px-4 text-[#003333]/70 dark:text-white/70">Unit Cost / BTC Value per Unit</td>
                      <td className="py-4 px-4 text-[#003333] dark:text-white">{formatNumber(metrics.navPremiumEquity, 2)}x</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-[#003333] dark:text-white font-medium">NAV Premium (Convertible)</td>
                      <td className="py-4 px-4 text-[#003333]/70 dark:text-white/70">Premium multiple of convertible unit price over BTC value per unit.</td>
                      <td className="py-4 px-4 text-[#003333]/70 dark:text-white/70">Convertible Cost / BTC Value per Unit</td>
                      <td className="py-4 px-4 text-[#003333] dark:text-white">{formatNumber(metrics.navPremiumConvertible, 2)}x</td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-4 text-sm text-[#003333]/70 dark:text-white/70 italic">
                  Note: BTC $ Gain and BTC Gain are <strong>not currently reported</strong> since there has been no increase in BTC holdings or change in unit structure since last reporting period. These metrics will be updated upon future treasury actions.
                </div>
              </div>
            ) : (
              <div className="text-center text-[#003333] dark:text-white">
                No metrics data available.
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
} 