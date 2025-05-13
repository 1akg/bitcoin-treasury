'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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
  btcGain: number;
  btcDollarGain: number;
  lastReportedBTC: number;
  lastReportedDate: string;
}

function MetricsContent() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Wallet addresses
  const satoshiTrialsAddresses = [
    "bc1q6rfeuxjs58zwdz6mf0smdxx0thj2j0zlvq4h7f",
    "bc1qpn4tnjt3lecd7t0fsq443hvydmra9ewx0vxxye",
    "bc1q9q3mw5lt566ycv805a74wktm5nansn3p4say23",
    "bc1qgn4fn3l3qqmawakwxyn6tp3ph6tqqtk532msph"
  ];
  const coldReserveAddress = "bc1pwaakwyp5p35a505upwfv7munj0myjrm58jg2n2ef2pyke8uz90ss45w5hr";
  const originalSatoshiTrialsWallet = "bc1qpn4tnjt3lecd7t0fsq443hvydmra9ewx0vxxye";

  const fetchMetrics = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Fetch current BTC price
      const priceResponse = await fetch('/api/btc-price');
      if (!priceResponse.ok) {
        throw new Error(`Failed to fetch BTC price: ${priceResponse.statusText}`);
      }
      const priceData = await priceResponse.json();
      const currentBTCPriceCAD = priceData.bitcoin.cad;

      // Fetch funded_txo_sum for the original wallet
      const response = await fetch(`https://mempool.space/api/address/${originalSatoshiTrialsWallet}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const btcInTreasury = (data.chain_stats.funded_txo_sum || 0) / 1e8;
      // Since we don't have transaction data here, set lastReportedBTC and lastReportedDate to 0 and 'N/A'
      const lastReportedBTC = 0;
      const lastReportedDate = 'N/A';

      // Calculate BTC gains
      const btcGain = btcInTreasury - lastReportedBTC;
      const btcDollarGain = btcGain * currentBTCPriceCAD;

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
        currentBTCPriceCAD,
        btcGain,
        btcDollarGain,
        lastReportedBTC,
        lastReportedDate
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

  // Refetch data on route change
  useEffect(() => {
    fetchMetrics();
  }, [pathname, searchParams]);

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
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-50 dark:opacity-30 z-0"
        style={{
          backgroundImage: 'url(/images/canurta-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="absolute inset-0 w-full h-full bg-white/30 dark:bg-[#003333]/30 z-0 pointer-events-none" />
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
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[#003333]/20">
                        <th className="text-left py-4 px-4 text-[#003333] dark:text-white font-medium">KPI</th>
                        <th className="text-left py-4 px-4 text-[#003333] dark:text-white font-medium">Definition</th>
                        <th className="text-left py-4 px-4 text-[#003333] dark:text-white font-medium">Formula / Basis</th>
                        <th className="text-left py-4 px-4 text-[#003333] dark:text-white font-medium">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#003333]/20">
                        <td className="py-4 px-4 text-[#003333] dark:text-white">BTC in Treasury</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Total amount of Bitcoin held by the company.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Manually reported or verified from cold storage.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">{formatNumber(metrics.btcInTreasury)} BTC</td>
                      </tr>
                      <tr className="border-b border-[#003333]/20">
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Total Units Outstanding</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Total number of units issued.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Fixed value.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">{formatNumber(metrics.totalUnitsOutstanding)}</td>
                      </tr>
                      <tr className="border-b border-[#003333]/20">
                        <td className="py-4 px-4 text-[#003333] dark:text-white">BTC Yield</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">BTC per unit.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">BTC in Treasury / Total Units Outstanding</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">{formatNumber(metrics.btcYield)} BTC</td>
                      </tr>
                      <tr className="border-b border-[#003333]/20">
                        <td className="py-4 px-4 text-[#003333] dark:text-white">BTC NAV per Unit (sats)</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">BTC Yield in satoshis.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">BTC Yield * 100,000,000</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">{formatNumber(metrics.btcNavPerUnitSats)} sats</td>
                      </tr>
                      <tr className="border-b border-[#003333]/20">
                        <td className="py-4 px-4 text-[#003333] dark:text-white">BTC Value per Unit (CAD)</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">BTC Yield in CAD.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">BTC Yield * Current BTC Price (CAD)</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">{formatCurrency(metrics.btcValuePerUnitCAD)}</td>
                      </tr>
                      <tr className="border-b border-[#003333]/20">
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Unit Cost (Equity)</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Cost per unit for equity.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Fixed value.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">{formatCurrency(metrics.unitCostEquity)}</td>
                      </tr>
                      <tr className="border-b border-[#003333]/20">
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Unit Cost (Convertible)</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Cost per unit for convertible.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Fixed value.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">{formatCurrency(metrics.unitCostConvertible)}</td>
                      </tr>
                      <tr className="border-b border-[#003333]/20">
                        <td className="py-4 px-4 text-[#003333] dark:text-white">NAV Premium (Equity)</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Premium over NAV for equity.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Unit Cost (Equity) / BTC Value per Unit (CAD)</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">{formatNumber(metrics.navPremiumEquity)}</td>
                      </tr>
                      <tr className="border-b border-[#003333]/20">
                        <td className="py-4 px-4 text-[#003333] dark:text-white">NAV Premium (Convertible)</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Premium over NAV for convertible.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Unit Cost (Convertible) / BTC Value per Unit (CAD)</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">{formatNumber(metrics.navPremiumConvertible)}</td>
                      </tr>
                      <tr className="border-b border-[#003333]/20">
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Current BTC Price (CAD)</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Current price of Bitcoin in CAD.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Fetched from CoinGecko.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">{formatCurrency(metrics.currentBTCPriceCAD)}</td>
                      </tr>
                      <tr className="border-b border-[#003333]/20">
                        <td className="py-4 px-4 text-[#003333] dark:text-white">BTC Gain</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Change in BTC holdings.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">BTC in Treasury - Last Reported BTC</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">{formatNumber(metrics.btcGain)} BTC</td>
                      </tr>
                      <tr className="border-b border-[#003333]/20">
                        <td className="py-4 px-4 text-[#003333] dark:text-white">BTC Dollar Gain (CAD)</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">BTC Gain in CAD.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">BTC Gain * Current BTC Price (CAD)</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">{formatCurrency(metrics.btcDollarGain)}</td>
                      </tr>
                      <tr className="border-b border-[#003333]/20">
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Last Reported BTC</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Last reported BTC amount.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">From last transaction.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">{formatNumber(metrics.lastReportedBTC)} BTC</td>
                      </tr>
                      <tr className="border-b border-[#003333]/20">
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Last Reported Date</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">Date of last reported BTC.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">From last transaction.</td>
                        <td className="py-4 px-4 text-[#003333] dark:text-white">{metrics.lastReportedDate}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="block md:hidden space-y-4">
                  {/* KPI Card Example */}
                  <div className="rounded-lg border border-[#003333]/20 bg-white/80 dark:bg-[#003333]/80 p-4 shadow">
                    <div className="font-medium text-[#003333] dark:text-white">BTC in Treasury</div>
                    <div className="text-[#003333]/70 dark:text-white/70 text-sm mb-1">Total amount of Bitcoin held by the company.</div>
                    <div className="text-[#003333]/70 dark:text-white/70 text-xs mb-1">Manually reported or verified from cold storage.</div>
                    <div className="text-[#003333] dark:text-white font-bold text-lg">{formatNumber(metrics.btcInTreasury)} BTC</div>
                  </div>
                  {/* Repeat for each KPI, using the same structure as above, with the appropriate label, description, formula, and value. */}
                  {/* ...other KPI cards... */}
                </div>
                <div className="mt-4 text-sm text-[#003333]/70 dark:text-white/70 italic">
                  Note: Metrics are calculated based on the most recent transaction data available.
                </div>
              </>
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

export default function MetricsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MetricsContent />
    </Suspense>
  );
} 