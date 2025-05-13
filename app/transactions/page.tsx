'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '../components/layout/footer';

interface Transaction {
  txid: string;
  value: number;
  status: {
    confirmed: boolean;
    block_time: number;
  };
  fee: number;
  historicalPrice?: {
    usd: number;
    cad: number;
  };
  address: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);

  // Wallet addresses
  const satoshiTrialsAddresses = [
    "bc1q6rfeuxjs58zwdz6mf0smdxx0thj2j0zlvq4h7f",
    "bc1qpn4tnjt3lecd7t0fsq443hvydmra9ewx0vxxye",
    "bc1q9q3mw5lt566ycv805a74wktm5nansn3p4say23",
    "bc1qgn4fn3l3qqmawakwxyn6tp3ph6tqqtk532msph"
  ];
  const coldReserveAddress = "bc1pwaakwyp5p35a505upwfv7munj0myjrm58jg2n2ef2pyke8uz90ss45w5hr";

  const fetchHistoricalPrice = async (timestamp: number, retries = 3, delay = 1000): Promise<{ usd: number; cad: number } | undefined> => {
    try {
      const date = new Date(timestamp * 1000);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${formattedDate}&localization=false`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        console.warn('CoinGecko API error:', response.status);
        if (retries > 0) {
          await new Promise(res => setTimeout(res, delay));
          return fetchHistoricalPrice(timestamp, retries - 1, delay * 2);
        }
        return undefined;
      }
      const data = await response.json();
      if (!data.market_data?.current_price) {
        console.warn('No price data available for date:', formattedDate);
        return undefined;
      }
      return {
        usd: data.market_data.current_price.usd,
        cad: data.market_data.current_price.cad
      };
    } catch (error) {
      console.warn('Error fetching historical price:', error);
      if (retries > 0) {
        await new Promise(res => setTimeout(res, delay));
        return fetchHistoricalPrice(timestamp, retries - 1, delay * 2);
      }
      return undefined;
    }
  };

  const fetchTransactions = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const allTransactions: Transaction[] = [];

      for (const address of [...satoshiTrialsAddresses, coldReserveAddress]) {
        try {
          const response = await fetch(`https://blockstream.info/api/address/${address}/txs`);
          if (!response.ok) {
            console.warn(`Error fetching transactions for ${address}:`, response.statusText);
            continue;
          }
          const txs = await response.json();
          for (const tx of txs) {
            try {
              const value = tx.vout.reduce((sum: number, vout: any) => {
                if (vout.scriptpubkey_address === address) {
                  return sum + vout.value;
                }
                return sum;
              }, 0);
              if (value > 0) {
                const historicalPrice = tx.status.block_time ? 
                  await fetchHistoricalPrice(tx.status.block_time) : 
                  undefined;
                allTransactions.push({
                  txid: tx.txid,
                  status: {
                    confirmed: tx.status.confirmed,
                    block_time: tx.status.block_time
                  },
                  fee: tx.fee,
                  value,
                  historicalPrice,
                  address
                });
              }
            } catch (error) {
              console.warn(`Error processing transaction ${tx.txid}:`, error);
            }
          }
        } catch (error) {
          console.warn(`Error processing address ${address}:`, error);
        }
      }
      allTransactions.sort((a, b) => {
        const timeA = a.status.block_time ?? Math.floor(Date.now() / 1000);
        const timeB = b.status.block_time ?? Math.floor(Date.now() / 1000);
        return timeB - timeA;
      });
      setTransactions(allTransactions);
      setIsLoading(false);
    } catch (error) {
      setError('Error fetching transactions. Please try again later.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatBTC = (value: number): string => {
    return (value / 1e8).toFixed(8);
  };

  const formatCurrency = (value: number | undefined, currency: string): string => {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
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
            width: 'min(90%, 42rem)',
            maxWidth: '100%'
          }}
        >
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl sm:text-3xl font-light text-[#003333] dark:text-white tracking-wide">
                Transaction History
              </h1>
              <Link 
                href="/"
                className="text-sm text-[#003333] dark:text-white hover:text-[#004444] dark:hover:text-[#F7FF59] underline decoration-1 underline-offset-4"
              >
                Back to Dashboard
              </Link>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center text-[#003333] dark:text-white">
                  Loading transactions...
                </div>
              ) : error ? (
                <div className="text-center text-red-600 dark:text-red-400">
                  {error}
                  <button 
                    onClick={fetchTransactions}
                    className="mt-4 block mx-auto px-4 py-2 bg-[#003333] text-white rounded hover:bg-[#004444]"
                  >
                    Retry
                  </button>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center text-[#003333] dark:text-white">
                  No transactions found
                </div>
              ) : (
                <>
                  {transactions.slice(0, visibleCount).map((tx) => (
                    <div key={tx.txid} className="border border-[#003333]/20 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#003333]/70 dark:text-white/70">
                          {formatDate(tx.status.block_time)}
                        </span>
                        <div className="flex items-center gap-2">
                          {tx.address === "bc1q6rfeuxjs58zwdz6mf0smdxx0thj2j0zlvq4h7f" && (
                            <span className="text-sm text-[#F7FF59] bg-[#003333] dark:bg-[#002222] px-2 py-1 rounded">
                              Moved to Collateral
                            </span>
                          )}
                          <span className={`text-sm ${tx.status.confirmed ? 'text-green-600' : 'text-yellow-600'}`}>
                            {tx.status.confirmed ? 'Confirmed' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-start">
                        <div className="text-lg font-light text-[#003333] dark:text-white">
                          {formatBTC(tx.value)} BTC
                        </div>
                        {tx.historicalPrice && (
                          <div className="text-right text-sm text-[#003333]/70 dark:text-white/70">
                            <div>USD: {formatCurrency(tx.value / 100000000 * tx.historicalPrice.usd, 'USD')}</div>
                            <div>CAD: {formatCurrency(tx.value / 100000000 * tx.historicalPrice.cad, 'CAD')}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#003333]/70 dark:text-white/70">
                          Fee: {formatBTC(tx.fee)} BTC
                        </span>
                        <a
                          href={`https://blockstream.info/tx/${tx.txid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#003333] dark:text-white hover:text-[#004444] dark:hover:text-[#F7FF59] underline decoration-1 underline-offset-4"
                        >
                          View on Blockstream
                        </a>
                      </div>
                    </div>
                  ))}
                  {visibleCount < transactions.length && (
                    <button
                      onClick={() => setVisibleCount(visibleCount + 5)}
                      className="mt-4 block mx-auto px-4 py-2 bg-[#003333] text-white rounded hover:bg-[#004444]"
                    >
                      Load More
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}