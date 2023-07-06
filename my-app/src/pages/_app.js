import "@/styles/globals.css";
import { PROVIDER_ID, WalletProvider, useInitializeProviders, reconnectProviders } from "@txnlab/use-wallet";
import { WalletConnectModalSign } from "@walletconnect/modal-sign-html";
import { useEffect } from "react";
import { getNetworkCredentials } from "@/clients";
const algosdk = require("algosdk");

const network = process.env.NEXT_PUBLIC_NETWORK || "SandNet";
const { algod } = getNetworkCredentials(network);

export default function App({ Component, pageProps }) {
  const walletProviders = useInitializeProviders({
    providers: [
      {
        id: PROVIDER_ID.WALLETCONNECT,
        clientOptions: { shouldShowSignTxnToast: false },
        clientStatic: WalletConnectModalSign,
        clientOptions: {
          projectId: "788742a0aee616db952deca86f49cdb3",
          metadata: {
            name: "Example Dapp",
            description: "Example Dapp",
            url: "#",
            icons: ["https://walletconnect.com/walletconnect-logo.png"],
          }
        },
      }
    ],
    nodeConfig: {
      network: network.toLowerCase(),
      nodeServer: algod.address,
      nodeToken: algod.token,
      nodePort: algod.port
    },
    algosdkStatic: algosdk,
  });

  useEffect(() => {
    if (walletProviders) reconnectProviders(walletProviders);
  }, [walletProviders]);

  return (
    <WalletProvider value={walletProviders}>
      <Component {...pageProps} />
    </WalletProvider>
  );
}
