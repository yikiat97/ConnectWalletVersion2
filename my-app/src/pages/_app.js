import "@/styles/globals.css";

import { PROVIDER_ID, WalletProvider, useInitializeProviders ,reconnectProviders} from '@txnlab/use-wallet'
import { DeflyWalletConnect } from '@blockshake/defly-connect'
import { PeraWalletConnect } from '@perawallet/connect'
import { WalletConnectModalSign } from '@walletconnect/modal-sign-html'
import { useEffect } from "react";
const algosdk = require('algosdk');





export default function App({ Component, pageProps }) {

    const walletProviders = useInitializeProviders({
        providers: [
          { id: PROVIDER_ID.DEFLY, clientStatic: DeflyWalletConnect },
          { id: PROVIDER_ID.PERA, clientStatic: PeraWalletConnect, clientOptions: { shouldShowSignTxnToast: false } },
          {
            id: PROVIDER_ID.WALLETCONNECT, clientOptions: { shouldShowSignTxnToast: false },
            clientStatic: WalletConnectModalSign,
            clientOptions: {
              projectId: 'eac3a7121b76e1f5b10573a85811e189',
              metadata: {
                name: 'Example Dapp',
                description: 'Example Dapp',
                url: '#',
                icons: ['https://walletconnect.com/walletconnect-logo.png']
              },
              modalOptions: {
                themeMode: 'dark'
              }
            }
          },
          { id: PROVIDER_ID.EXODUS }
        ],
        nodeConfig: {
          network: 'testnet',
          nodeServer: 'https://testnet-api.algonode.cloud',
          nodeToken: '',
          nodePort: '443'
        },
        algosdkStatic: algosdk
      })
    
    useEffect(() => {
        reconnectProviders(walletProviders);
    }, []);

    return (
        <WalletProvider value={walletProviders}>
            <Component {...pageProps} />
        </WalletProvider>
    );
}
