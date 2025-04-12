'use client';

import { useEffect, useState } from 'react';

export default function Page() {
  const [isLoaded, setIsLoaded] = useState(false);
  // Wallet addresses
  const satoshiTrialsAddress = "bc1qgn4fn3l3qqmawakwxyn";  // Replace with actual address
  const treasuryReserveAddress = "bc1pwaakwyp5p35a505upwfv7munj0myjrm58jg2n2ef2pyke8uz90ss45w5hr";
  const policyBackedAmount = 0; // Set to 0 BTC for now

  const [satoshiTrialsBalance, setSatoshiTrialsBalance] = useState<number>(0);
  const [treasuryReserveBalance, setTreasuryReserveBalance] = useState<number>(0);
  const [usdPrice, setUsdPrice] = useState<number>(0);
  const [cadPrice, setCadPrice] = useState<number>(0);

  const totalBTC = satoshiTrialsBalance + treasuryReserveBalance + policyBackedAmount;

  useEffect(() => {
    const fetchWalletBalance = async (address: string) => {
      try {
        const response = await fetch(`https://blockstream.info/api/address/${address}`);
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
        const data = await response.json();
        setUsdPrice(data.bitcoin.usd);
        setCadPrice(data.bitcoin.cad);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    const updateBalances = async () => {
      const satoshiBalance = await fetchWalletBalance(satoshiTrialsAddress);
      const treasuryBalance = await fetchWalletBalance(treasuryReserveAddress);
      setSatoshiTrialsBalance(satoshiBalance);
      setTreasuryReserveBalance(treasuryBalance);
      setIsLoaded(true);
    };

    updateBalances();
    fetchPrices();

    const balanceInterval = setInterval(updateBalances, 5 * 60 * 1000);
    const pricesInterval = setInterval(fetchPrices, 5 * 60 * 1000);

    return () => {
      clearInterval(balanceInterval);
      clearInterval(pricesInterval);
    };
  }, []);

  const formatBTC = (value: number) => value.toFixed(5);
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <main 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-white"
      style={{
        backgroundImage: 'url("/images/canurta-bg.jpg")',
        backgroundColor: '#ffffff',
      }}
    >
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className={`backdrop-blur-sm bg-white/30 rounded-xl p-8 shadow-2xl border border-[#003333]/20 max-w-2xl w-full transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="space-y-8">
            {/* Individual Wallets Section */}
            <div className="space-y-6">
              <div className={`space-y-2 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <h2 className="text-xl font-light text-[#003333] tracking-wide">Satoshi Trials</h2>
                <div className="text-2xl font-light text-[#003333] pl-4">
                  {formatBTC(satoshiTrialsBalance)} BTC
                </div>
              </div>

              <div className={`space-y-2 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <h2 className="text-xl font-light text-[#003333] tracking-wide">Treasury Reserve</h2>
                <div className="text-2xl font-light text-[#003333] pl-4">
                  {formatBTC(treasuryReserveBalance)} BTC
                </div>
              </div>

              <div className={`space-y-2 transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <h2 className="text-xl font-light text-[#003333] tracking-wide">Policy-Backed BTC (COLI)</h2>
                <div className="text-2xl font-light text-[#003333] pl-4">
                  {formatBTC(policyBackedAmount)} BTC
                </div>
              </div>
            </div>

            {/* Total Holdings Section */}
            <div className={`pt-6 border-t border-[#003333]/20 space-y-4 transition-all duration-700 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="space-y-2">
                <h2 className="text-2xl font-light text-[#003333] tracking-wide">Total BTC</h2>
                <div className="text-3xl font-light text-[#F7FF59] bg-[#003333] py-2 px-4 rounded-lg text-center">
                  {formatBTC(totalBTC)} BTC
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="text-lg text-[#003333] font-light">CAD</div>
                  <div className="text-xl text-[#003333] font-light pl-2">
                    {formatCurrency(totalBTC * cadPrice, 'CAD')}
                  </div>
                </div>
                <div>
                  <div className="text-lg text-[#003333] font-light">USD</div>
                  <div className="text-xl text-[#003333] font-light pl-2">
                    {formatCurrency(totalBTC * usdPrice, 'USD')}
                  </div>
                </div>
              </div>
            </div>

            {/* BTC Price Section */}
            <div className={`pt-6 border-t border-[#003333]/20 transition-all duration-700 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h2 className="text-2xl font-light text-[#003333] tracking-wide mb-4">BTC Price</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-lg text-[#003333] font-light">CAD</div>
                  <div className="text-xl text-[#003333] font-light pl-2">
                    {formatCurrency(cadPrice, 'CAD')}
                  </div>
                </div>
                <div>
                  <div className="text-lg text-[#003333] font-light">USD</div>
                  <div className="text-xl text-[#003333] font-light pl-2">
                    {formatCurrency(usdPrice, 'USD')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
