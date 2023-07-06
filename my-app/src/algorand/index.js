import algosdk from "algosdk";
//import IndexerClient from "algosdk/dist/types/client/v2/indexer/indexer";
import getIndexerClient from "../clients/index";
import axios from "axios";
import { DEFAULT_NETWORK } from "@txnlab/use-wallet";

// Write functions to do the following,
// 1. Create the necessary transactions for deploying and transacting NFTs
// 2. To fetch NFTs from seller account to display it in the UI

const getPaymentTxn = async (algodClient, from, to, amount) => {
    const suggestedParams = await algodClient.getTransactionParams().do();
  
    return algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from,
      to,
      amount,
      suggestedParams,
    });
  };
  
  const getCreateNftTxn = async (algodClient, from, assetName, defaultFrozen, unitName, assetURL, metadata) => {
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const jsontToUnit8array = (json) => {
      const jsonString = JSON.stringify(json);
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(jsonString);
      return uint8Array;
    };

    const metadataEncoded = jsontToUnit8array(metadata);
  
    // txn to create a pure nft
    return algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from,
      assetName,
      total: 1,
      decimals: 0,
      defaultFrozen,
      unitName,
      assetURL,
      suggestedParams,
      note: metadataEncoded 
    });
    
  };
  
  const signAndSubmit = async (algodClient, txns, signer) => {
    // used by backend to sign and submit txns
    const groupedTxns = algosdk.assignGroupID(txns);
  
    const signedTxns = groupedTxns.map((txn) => txn.signTxn(signer.sk));
  
    const response = await algodClient.sendRawTransaction(signedTxns).do();
  
    const confirmation = await algosdk.waitForConfirmation(algodClient, response.txId, 4);
  
    return {
      response,
      confirmation,
    };
  };
  
  const fetchNFTs = async (algodClient) => {
    const deployerAddr = process.env.NEXT_PUBLIC_DEPLOYER_ADDR;
    const { assets } = await algodClient.accountInformation(deployerAddr).do();


    function base64ToJson(base64String) {
      const buffer = Buffer.from(base64String, "base64");
      const jsonString = buffer.toString("utf-8");
      const jsonObj = JSON.parse(jsonString);
      return jsonObj;
    }

    let nfts = [];
    const network = process.env.NEXT_PUBLIC_NETWORK
       console.log(network)
    const token = network == "TestNet"? process.env.NEXT_PUBLIC_INDEXER_TOKEN_TESTNET: process.env.NEXT_PUBLIC_INDEXER_TOKEN;
    const port = network == "TestNet"? process.env.NEXT_PUBLIC_INDEXER_PORT_TESTNET: process.env.NEXT_PUBLIC_INDEXER_PORT ;
    const server = network == "TestNet"? process.env.NEXT_PUBLIC_INDEXER_ADDRESS_TESTNET: process.env.NEXT_PUBLIC_INDEXER_SERVER;
    //const indexer_var = getIndexerClient(process.env.NEXT_PUBLIC_NETWORK)
    const indexer_client = new algosdk.Indexer(token, server, port);
    var note = undefined;
    if (assets) {
      for (let asset of assets) {
      
        // await indexer_client.lookupAssetTransactions(asset["asset-id"]).do()
        // .then((transactions)=>  transactions.transactions.filter((txn)=>{txn["tx-type"] === "acfg"})
        // .forEach((txn)=> {
        //   if (txn.note !== undefined){
        //     console.log(txn.note)
        //     note = uint8ArrayToJson(txn.note)

        //   }
        // })
        // );
        
        const assetTxns = await indexer_client
        .lookupAssetTransactions(asset["asset-id"])
        .do();
      const acfg_txns = assetTxns.transactions
        .filter((txns) => txns["tx-type"] === "acfg")
        .forEach((txns) => {
          if (txns.note != undefined) {
            try {
              console.log(txns.note)
              note = base64ToJson(txns.note);
            } catch (e) {
              console.log(e);
            }}
          });
        
        
        const assetInfo = await algodClient.getAssetByID(asset["asset-id"]).do();
        const { decimals, total, url } = assetInfo.params;
  
        const isNFT = url !== undefined && url.includes("ipfs://") && total === 1 && decimals === 0;
        const deployerHasNFT = asset.amount > 0;
  
        if (isNFT && deployerHasNFT) {
          try {
            // fetch JSON metadata based on ARC3 spec, we will replace the ipfs scheme with a gateway url in order to display it on the UI
            
            const metadata = note;
            
  
            const imgUrl = url.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/");
  
            nfts.push({
              asset,
              assetInfo,
              metadata,
              imgUrl,
            });
          } catch (error) {
            console.log(error);
            continue;
          }
        }
      }
    }
    
  
    return nfts;
  };
  
  const getAssetOptInTxn = async (algodClient, accAddr, assetId) => {
    const suggestedParams = await algodClient.getTransactionParams().do();
  
    return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: accAddr,
      to: accAddr,
      assetIndex: assetId,
      suggestedParams,
    });
  };
  
  const getNFTFromDeployer = async (algodClient, accAddr, assetId) => {
    const suggestedParams = await algodClient.getTransactionParams().do();
  
    // for demo purposes, never expose mnemonic in frontend to sign txns
    const deployer = algosdk.mnemonicToSecretKey(process.env.NEXT_PUBLIC_DEPLOYER_MNEMONIC);
  
    // asset transfer
    const assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: deployer.addr,
      to: accAddr,
      assetIndex: assetId,
      suggestedParams,
      amount: 1,
    });
  
    return await signAndSubmit(algodClient, [assetTransferTxn], deployer);
  };
  
  export { getPaymentTxn, getCreateNftTxn, signAndSubmit, fetchNFTs, getAssetOptInTxn, getNFTFromDeployer };
  
export {};
