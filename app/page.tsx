'use client';

import { useEffect, useState } from 'react';
import Footer from './components/layout/footer';
import Link from 'next/link';

export default function Page() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [countdown, setCountdown] = useState(20);
  // Wallet addresses
  const satoshiTrialsAddresses = [
    "bc1q6rfeuxjs58zwdz6mf0smdxx0thj2j0zlvq4h7f",  // New collateral address
    "bc1qpn4tnjt3lecd7t0fsq443hvydmra9ewx0vxxye",  // Current address
    "bc1q9q3mw5lt566ycv805a74wktm5nansn3p4say23",  // Previous address
    "bc1qgn4fn3l3qqmawakwxyn6tp3ph6tqqtk532msph"   // Previous address
  ];
  const coldReserveAddress = "bc1pwaakwyp5p35a505upwfv7munj0myjrm58jg2n2ef2pyke8uz90ss45w5hr";

  const [satoshiTrialsBalance, setSatoshiTrialsBalance] = useState<number>(0);
  const [coldReserveBalance, setColdReserveBalance] = useState<number>(0);
  const [usdPrice, setUsdPrice] = useState<number>(0);
  const [cadPrice, setCadPrice] = useState<number>(0);

  const totalBTC = satoshiTrialsBalance + coldReserveBalance;

  useEffect(() => {
    const fetchWalletBalance = async (address: string) => {
      // This function is now unused, replaced by fetchAllWalletBalances
      return 0;
    };

    const fetchAllWalletBalances = async () => {
      try {
        const params = satoshiTrialsAddresses.map(addr => `address=${addr}`).join('&') + `&address=${coldReserveAddress}`;
        const response = await fetch(`/api/btc-balance?${params}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        // Sum Satoshi Trials balances only
        const satoshiTrialsBalance = satoshiTrialsAddresses.reduce((sum, addr) => sum + (data.balances[addr] || 0), 0);
        setSatoshiTrialsBalance(satoshiTrialsBalance);
        setColdReserveBalance(data.balances[coldReserveAddress] || 0);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching balances:', error);
        setSatoshiTrialsBalance(0);
        setColdReserveBalance(0);
        setIsLoaded(true);
      }
    };

    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/btc-price');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setUsdPrice(data.bitcoin.usd);
        setCadPrice(data.bitcoin.cad);
        setCountdown(20); // Reset countdown after fetch
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    const updateBalances = async () => {
      await fetchAllWalletBalances();
    };

    // Initial fetches
    updateBalances();
    fetchPrices();

    // Set up intervals
    const balanceInterval = setInterval(updateBalances, 20 * 1000); // Every 20 seconds
    const pricesInterval = setInterval(fetchPrices, 20 * 1000); // Every 20 seconds
    const countdownInterval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 20));
    }, 1000);

    return () => {
      clearInterval(balanceInterval);
      clearInterval(pricesInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  const formatBTC = (value: number) => value.toFixed(8); // Show 8 decimal places for BTC
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      currencyDisplay: currency === 'CAD' ? 'narrowSymbol' : 'symbol'
    }).format(value);
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
          <div className="space-y-6 sm:space-y-8">
            {/* Individual Wallets Section */}
            <div className="space-y-4 sm:space-y-6">
              <div className={`space-y-2 sm:space-y-3 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <h2 className="text-lg sm:text-xl md:text-2xl font-light text-[#003333] dark:text-white tracking-wide">Satoshi Trials</h2>
                <div className="text-xl sm:text-2xl md:text-3xl font-light text-[#003333] dark:text-white pl-2 sm:pl-4">
                  {formatBTC(satoshiTrialsBalance)} BTC
                </div>
              </div>

              <div className={`space-y-2 sm:space-y-3 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <h2 className="text-lg sm:text-xl md:text-2xl font-light text-[#003333] dark:text-white tracking-wide">Cold Reserve</h2>
                <div className="text-xl sm:text-2xl md:text-3xl font-light text-[#003333] dark:text-white pl-2 sm:pl-4">
                  {formatBTC(coldReserveBalance)} BTC
                </div>
              </div>
            </div>

            {/* Total Holdings Section */}
            <div className={`pt-4 sm:pt-6 border-t border-[#003333]/20 space-y-3 sm:space-y-4 transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="space-y-2 sm:space-y-3">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-[#003333] dark:text-white tracking-wide">Total BTC</h2>
                <div className="text-2xl sm:text-3xl md:text-4xl font-light text-[#F7FF59] bg-[#003333] dark:bg-[#002222] py-2 px-4 rounded-lg text-center">
                  {formatBTC(totalBTC)} BTC
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="text-lg sm:text-xl font-light text-[#003333] dark:text-white">CAD</div>
                  <div className="text-xl sm:text-2xl font-light text-[#003333] dark:text-white pl-2">
                    {formatCurrency(totalBTC * cadPrice, 'CAD')}
                  </div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-light text-[#003333] dark:text-white">USD</div>
                  <div className="text-xl sm:text-2xl font-light text-[#003333] dark:text-white pl-2">
                    {formatCurrency(totalBTC * usdPrice, 'USD')}
                  </div>
                </div>
              </div>
            </div>

            {/* BTC Price Section */}
            <div className={`pt-6 border-t border-[#003333]/20 transition-all duration-700 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h2 className="text-2xl font-light text-[#003333] dark:text-white tracking-wide mb-4">BTC Price</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-lg text-[#003333] dark:text-white font-light">CAD</div>
                  <div className="text-xl text-[#003333] dark:text-white font-light pl-2">
                    {formatCurrency(cadPrice, 'CAD')}
                  </div>
                </div>
                <div>
                  <div className="text-lg text-[#003333] dark:text-white font-light">USD</div>
                  <div className="text-xl text-[#003333] dark:text-white font-light pl-2">
                    {formatCurrency(usdPrice, 'USD')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Fetching Status */}
        <div className="mt-4 text-center text-[#003333] dark:text-white text-sm font-light">
          Fetching latest in {countdown} seconds
        </div>

        {/* Links Section */}
        <div className="mt-4 text-center mb-16 px-4 max-w-full space-y-4">
          <a 
            href="https://mirror.xyz/canurta.eth/-jurXb6wU3CQzGIB0tgaxwynfweXNxS5PtA5TwqWjtM"
            target="_blank"
            rel="noopener noreferrer"
            className="text-base sm:text-lg font-light text-[#003333] dark:text-white hover:text-[#004444] dark:hover:text-[#F7FF59] underline decoration-1 underline-offset-4 break-words inline-block max-w-full"
          >
            The Satoshi Trials Thesis: A Canurta Whitepaper
          </a>
          <div className="space-y-2">
            <Link 
              href="/transactions"
              className="text-base sm:text-lg font-light text-[#003333] dark:text-white hover:text-[#004444] dark:hover:text-[#F7FF59] underline decoration-1 underline-offset-4 block"
            >
              View Transaction History
            </Link>
            <Link 
              href="/metrics"
              className="text-base sm:text-lg font-light text-[#003333] dark:text-white hover:text-[#004444] dark:hover:text-[#F7FF59] underline decoration-1 underline-offset-4 block"
            >
              Treasury KPIs
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
