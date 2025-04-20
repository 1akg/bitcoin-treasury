import { createHash } from 'crypto';

interface BalanceProof {
  address: string;
  balance: number;
  timestamp: number;
}

export function generateMerkleRoot(balances: BalanceProof[]): string {
  if (balances.length === 0) return '';
  
  // Sort balances to ensure consistent ordering
  const sortedBalances = [...balances].sort((a, b) => a.address.localeCompare(b.address));
  
  // Create leaf nodes
  const leaves = sortedBalances.map(balance => 
    createHash('sha256')
      .update(`${balance.address}:${balance.balance}:${balance.timestamp}`)
      .digest('hex')
  );
  
  // Build merkle tree
  let currentLevel = leaves;
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : currentLevel[i];
      const combined = createHash('sha256')
        .update(left + right)
        .digest('hex');
      nextLevel.push(combined);
    }
    currentLevel = nextLevel;
  }
  
  return currentLevel[0];
}

export function verifyBalance(
  address: string,
  balance: number,
  timestamp: number,
  merkleRoot: string,
  proof: string[]
): boolean {
  let currentHash = createHash('sha256')
    .update(`${address}:${balance}:${timestamp}`)
    .digest('hex');
    
  for (const sibling of proof) {
    currentHash = createHash('sha256')
      .update(currentHash + sibling)
      .digest('hex');
  }
  
  return currentHash === merkleRoot;
} 