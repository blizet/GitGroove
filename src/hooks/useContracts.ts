'use client'

import { useMemo } from 'react'
import { usePublicClient, useWalletClient } from 'wagmi'
import { Address } from 'viem'

// 1. Define addresses as simple constants
const DEV_TOKEN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address
const ISSUE_MANAGEMENT_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' as Address
const ORACLE_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9' as Address

// 2. Type for individual contract (simplified)
type ContractConfig = {
  address: Address
  abi: any // Using any to break the type recursion
  walletClient: ReturnType<typeof useWalletClient>['data']
  publicClient: ReturnType<typeof usePublicClient>
}

export function useContracts() {
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  return useMemo(() => {
    if (!walletClient || !publicClient) return null

    // 3. Manually create each contract instance
    const devToken: ContractConfig = {
      address: DEV_TOKEN_ADDRESS,
      abi: require('@/abis/DEVToken.json'),
      walletClient,
      publicClient
    }

    const issueManagement: ContractConfig = {
      address: ISSUE_MANAGEMENT_ADDRESS,
      abi: require('@/abis/IssueManagement.json'),
      walletClient,
      publicClient
    }

    const oracle: ContractConfig = {
      address: ORACLE_ADDRESS,
      abi: require('@/abis/PoDOracle.json'),
      walletClient,
      publicClient
    }

    return { devToken, issueManagement, oracle }
  }, [walletClient, publicClient])
}

// 4. Export individual contract types for external use
export type Contracts = ReturnType<typeof useContracts>
export type DevTokenContract = NonNullable<Contracts>['devToken']
export type IssueManagementContract = NonNullable<Contracts>['issueManagement']
export type OracleContract = NonNullable<Contracts>['oracle']