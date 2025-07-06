import { JsonRpcProvider, Contract, formatEther, parseEther } from 'ethers';
import Issue from '../models/issue.js';
import { CONTRACT_ADDRESSES } from '../config/contracts.js';

let providerInstance = null;

export async function startTxMonitor() {
  try {
    providerInstance = new JsonRpcProvider(
      process.env.L2_RPC_URL || 'http://localhost:8545',
      31337 // match your chain ID
    );

    const network = await providerInstance.getNetwork();
    console.log(`✅ Connected to ${network.name} (Chain ID: ${network.chainId})`);

    const devToken = new Contract(
      CONTRACT_ADDRESSES.devToken,
      ['function balanceOf(address) view returns (uint256)'],
      providerInstance
    );

    const checkBalance = async () => {
      try {
        const balance = await devToken.balanceOf(CONTRACT_ADDRESSES.feePool);
        console.log(`💰 Current DEV in Pool: ${formatEther(balance)} DEV`);
      } catch (err) {
        console.error('❌ Balance check failed:', err.message);
      }
    };
    setInterval(checkBalance, 60_000);
    await checkBalance();

    providerInstance.on('block', async (blockNumber) => {
      try {
        const latest = await providerInstance.getBlockNumber();
        if (blockNumber > latest) {
          console.warn(`⚠️ Block ${blockNumber} > latest ${latest}. Skipping.`);
          return;
        }

        console.debug(`📦 Processing block ${blockNumber}`);
        const block = await providerInstance.getBlock(blockNumber);
        if (!block || block.transactions.length === 0) {
          console.debug(`ℹ️ No transactions in block ${blockNumber}.`);
          return;
        }

        await Promise.all(
          block.transactions.map(async txHash => {
            const tx = await providerInstance.getTransaction(txHash);
            if (tx?.value && tx.value.gt(parseEther('0.001'))) {
              try {
                await linkTxToOpenIssue(tx);
              } catch(e) {
                console.error(`❌ Error linking tx ${tx.hash.slice(0,8)}:`, e.message);
              }
            }
          })
        );
      } catch (err) {
        console.error(`❌ Block handler error at ${blockNumber}:`, err.message);
      }
    });

    // Example of using latest tag for tx count
    const safeTxCount = await providerInstance.getTransactionCount(
      '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
      'latest'
    );
    console.log('✅ Fetched tx count safely:', safeTxCount);

    return providerInstance;
  } catch (err) {
    console.error('❌ TxMonitor startup failed:', err.message);
    process.exit(1);
  }
}

async function linkTxToOpenIssue(tx) {
  const amount = parseFloat(formatEther(tx.value));
  const issue = await Issue.findOneAndUpdate(
    {
      state: 'open',
      assignee: { $exists: false },
      $or: [
        { fundingTx: { $exists: false } },
        { fundingTx: null }
      ]
    },
    {
      $set: {
        fundedAmount: amount,
        fundingTx: tx.hash,
        lastFunded: new Date()
      }
    },
    {
      sort: { created_at: 1 },
      new: true
    }
  );

  if (issue) {
    console.log(`🔗 Funded issue #${issue.number} with ${amount} ETH`);
    return issue;
  } else {
    console.warn(`⚠️ No open issues available for TX ${tx.hash.slice(0, 8)}`);
    return null;
  }
}
