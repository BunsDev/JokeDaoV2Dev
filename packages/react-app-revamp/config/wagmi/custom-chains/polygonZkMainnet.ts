import { Chain } from "wagmi";

export const polygonZkMainnet: Chain = {
  id: 1101,
  name: "PolygonZkMainnet",
  network: "polygonZkMainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    public: {
      http: ["https://zkevm-rpc.com"],
    },
    default: {
      http: [`https://polygonzkevm-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`],
    },
  },
  blockExplorers: {
    etherscan: { name: "Polygon zkEvm Mainnet Scan", url: "https://zkevm.polygonscan.com/" },
    default: { name: "Polygon zkEvm Mainnet Scan", url: "https://zkevm.polygonscan.com/" },
  },
};
