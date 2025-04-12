'use client';

import { useEffect, useState } from 'react';
import Footer from './components/layout/footer';

export default function Page() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [countdown, setCountdown] = useState(20);
  // Wallet addresses
  const satoshiTrialsAddress = "bc1qgn4fn3l3qqmawakwxyn6tp3ph6tqqtk532msph";  // Complete address
  const coldReserveAddress = "bc1pwaakwyp5p35a505upwfv7munj0myjrm58jg2n2ef2pyke8uz90ss45w5hr";

  const [satoshiTrialsBalance, setSatoshiTrialsBalance] = useState<number>(0);
  const [coldReserveBalance, setColdReserveBalance] = useState<number>(0);
  const [usdPrice, setUsdPrice] = useState<number>(0);
  const [cadPrice, setCadPrice] = useState<number>(0);

  const totalBTC = satoshiTrialsBalance + coldReserveBalance;

  useEffect(() => {
    const fetchWalletBalance = async (address: string) => {
      try {
        const response = await fetch(`https://blockstream.info/api/address/${address}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const balanceData = await response.json();
        return (balanceData.chain_stats.funded_txo_sum - balanceData.chain_stats.spent_txo_sum) / 1e8;
      } catch (error) {
        console.error('Error fetching balance:', error);
        return 0;
      }
    };

    const fetchPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,cad');
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
      const satoshiBalance = await fetchWalletBalance(satoshiTrialsAddress);
      const coldBalance = await fetchWalletBalance(coldReserveAddress);
      setSatoshiTrialsBalance(satoshiBalance);
      setColdReserveBalance(coldBalance);
      setIsLoaded(true);
    };

    // Initial fetches
    updateBalances();
    fetchPrices();

    // Set up intervals
    const balanceInterval = setInterval(updateBalances, 5 * 60 * 1000); // Every 5 minutes
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
    <main className="min-h-screen w-full bg-white dark:bg-[#003333] relative">
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-50 dark:opacity-30 z-0 overflow-hidden"
        style={{
          backgroundImage: 'url(/images/canurta-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'scroll',
          height: '100dvh',
          width: '100%',
          WebkitBackfaceVisibility: 'hidden',
          MozBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden'
        }}
      />
      <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 sm:px-6 md:px-8 py-4 relative z-1">
        <div className={`backdrop-blur-sm bg-white/30 dark:bg-[#003333]/30 rounded-xl p-4 sm:p-6 md:p-8 shadow-2xl border border-[#003333]/20 w-full max-w-[90%] sm:max-w-[85%] md:max-w-2xl mx-auto transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="space-y-6 sm:space-y-8">
            {/* Individual Wallets Section */}
            <div className="space-y-4 sm:space-y-6">
              <div className={`space-y-2 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <h2 className="text-lg sm:text-xl md:text-2xl font-light text-[#003333] dark:text-white tracking-wide">Satoshi Trials</h2>
                <div className="text-xl sm:text-2xl md:text-3xl font-light text-[#003333] dark:text-white pl-2 sm:pl-4">
                  {formatBTC(satoshiTrialsBalance)} BTC
                </div>
              </div>

              <div className={`space-y-2 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <h2 className="text-lg sm:text-xl md:text-2xl font-light text-[#003333] dark:text-white tracking-wide">Cold Reserve</h2>
                <div className="text-xl sm:text-2xl md:text-3xl font-light text-[#003333] dark:text-white pl-2 sm:pl-4">
                  {formatBTC(coldReserveBalance)} BTC
                </div>
              </div>
            </div>

            {/* Total Holdings Section */}
            <div className={`pt-4 sm:pt-6 border-t border-[#003333]/20 space-y-3 sm:space-y-4 transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="space-y-2">
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

        {/* Whitepaper Link */}
        <div className="mt-4 text-center mb-16 px-4 max-w-full">
          <a 
            href="https://mirror.xyz/canurta.eth/-jurXb6wU3CQzGIB0tgaxwynfweXNxS5PtA5TwqWjtM"
            target="_blank"
            rel="noopener noreferrer"
            className="text-base sm:text-lg font-light text-[#003333] dark:text-white hover:text-[#004444] dark:hover:text-[#F7FF59] underline decoration-1 underline-offset-4 break-words inline-block max-w-full"
          >
            The Satoshi Trials Thesis: A Canurta Whitepaper
          </a>
        </div>
      </div>
      <Footer />
    </main>
  );
}
