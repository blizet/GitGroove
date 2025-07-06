import {
  mainnet,
  polygon,
  citreaTestnet,
  scrollSepolia,
  sepolia,
} from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { milkomeda } from '@/utils/chains/Milkomeda';
import { ethereumClassic } from '@/utils/chains/EthereumClassic';
import { http } from 'wagmi';

const anvil = {
  id: 31337,
  name: 'PoD L2',
  network: 'pod l2',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['http://localhost:8545'],
    },
  },
};

export const config = getDefaultConfig({
  appName: 'GitGroove',
  projectId: 'DEFAULT_PROJECT_ID',
  chains: [
    scrollSepolia,
    polygon,
    mainnet,
    citreaTestnet,
    ethereumClassic,
    milkomeda,
    sepolia,
    anvil,
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [scrollSepolia.id]: http(),
    [citreaTestnet.id]: http(),
    [ethereumClassic.id]: http(),
    [milkomeda.id]: http(),
    [sepolia.id]: http(),
    [anvil.id]: http('http://localhost:8545'), // Explicitly define Anvil transport
  },
  ssr: true,
});
