/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  walletAddress: 'bc1q6920ksguf766wye08azalqfk9f426nqn3xx73r',
};

const [ticker, setTicker] = useState("1AKG");
const address = "bc1q6920ksguf766wye08azalqfk9f426nqn3xx73r";

const btcBalance = (balanceData.chain_stats.funded_txo_sum - balanceData.chain_stats.spent_txo_sum) / 1e8;
setHolding(btcBalance);

holding={holding.toFixed(5)}

module.exports = nextConfig;
