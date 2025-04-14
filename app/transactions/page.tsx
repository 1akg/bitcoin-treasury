'use client';

import { useEffect, useState } from 'react';
import Footer from '../components/layout/footer';
import Link from 'next/link';

interface Transaction {
  txid: string;
  status: {
    confirmed: boolean;
    block_height: number;
    block_time: number;
  };
  fee: number;
  value: number;
  type: 'received' | 'sent';
}

export default function TransactionsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [countdown, setCountdown] = useState(20);

  // Wallet addresses
  const satoshiTrialsAddresses = [
    "bc1qpn4tnjt3lecd7t0fsq443hvydmra9ewx0vxxye",
    "bc1q9q3mw5lt566ycv805a74wktm5nansn3p4say23",
    "bc1qgn4fn3l3qqmawakwxyn6tp3ph6tqqtk532msph"
  ];
  const coldReserveAddress = "bc1pwaakwyp5p35a505upwfv7munj0myjrm58jg2n2ef2pyke8uz90ss45w5hr";

  useEffect(() => {
    const fetchTransactions = async (address: string) => {
      try {
        const response = await fetch(`https://blockstream.info/api/address/${address}/txs`);
        if (!response.ok) throw new Error('Network response was not ok');
        const txs = await response.json();
        return txs.map((tx: any) => ({
          txid: tx.txid,
          status: {
            confirmed: tx.status.confirmed,
            block_height: tx.status.block_height,
            block_time: tx.status.block_time
          },
          fee: tx.fee / 1e8,
          value: tx.vout.reduce((sum: number, vout: any) => {
            if (vout.scriptpubkey_address === address) {
              return sum + vout.value / 1e8;
            }
            return sum;
          }, 0),
          type: 'received'
        }));
      } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
    };

    const updateTransactions = async () => {
      const allAddresses = [...satoshiTrialsAddresses, coldReserveAddress];
      const allTransactions = await Promise.all(
        allAddresses.map(addr => fetchTransactions(addr))
      );
      
      // Flatten and sort transactions by block time
      const sortedTransactions = allTransactions
        .flat()
        .sort((a, b) => b.status.block_time - a.status.block_time);
      
      setTransactions(sortedTransactions);
      setIsLoaded(true);
    };

    // Initial fetch
    updateTransactions();

    // Set up interval
    const interval = setInterval(updateTransactions, 20 * 1000); // Every 20 seconds
    const countdownInterval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 20));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, []);

  const formatBTC = (value: number) => value.toFixed(8);
  const formatDate = (timestamp: number) => {
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
          className={`backdrop-blur-sm bg-white/30 dark:bg-[#003333]/30 rounded-xl p-4 sm:p-6 md:p-8 shadow-2xl border border-[#003333]/20 mx-auto transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{
            width: 'min(90%, 42rem)',
            maxWidth: '100%'
          }}
        >
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl sm:text-3xl font-light text-[#003333] dark:text-white tracking-wide">Transaction History</h1>
              <Link 
                href="/"
                className="text-base sm:text-lg font-light text-[#003333] dark:text-white hover:text-[#004444] dark:hover:text-[#F7FF59] underline decoration-1 underline-offset-4"
              >
                Back to Dashboard
              </Link>
            </div>

            <div className="space-y-4">
              {transactions.map((tx) => (
                <div 
                  key={tx.txid}
                  className="border border-[#003333]/20 rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#003333]/70 dark:text-white/70">
                      {formatDate(tx.status.block_time)}
                    </span>
                    <span className={`text-sm ${tx.status.confirmed ? 'text-green-600' : 'text-yellow-600'}`}>
                      {tx.status.confirmed ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-light text-[#003333] dark:text-white">
                      {formatBTC(tx.value)} BTC
                    </span>
                    <span className="text-sm text-[#003333]/70 dark:text-white/70">
                      Fee: {formatBTC(tx.fee)} BTC
                    </span>
                  </div>
                  <a 
                    href={`https://blockstream.info/tx/${tx.txid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#003333] dark:text-white hover:text-[#004444] dark:hover:text-[#F7FF59] underline decoration-1 underline-offset-4 block truncate"
                  >
                    {tx.txid}
                  </a>
                </div>
              ))}
            </div>

            <div className="text-center text-[#003333] dark:text-white text-sm font-light">
              Fetching latest in {countdown} seconds
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
} 