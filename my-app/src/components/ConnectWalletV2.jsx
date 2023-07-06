import React, { useState } from "react";
import { useWallet } from "@txnlab/use-wallet";
const algosdk = require("algosdk");
import { getAlgodClient } from "../clients";
import Button from "./Button";

const network = process.env.NEXT_PUBLIC_NETWORK || "SandNet";
const algod = getAlgodClient(network);

function SendAlgo() {
  const [toAddress, setToAddress] = useState("");
  const [amountTosend, setAmount] = useState("10000");
  const { activeAddress, signTransactions, sendTransactions } = useWallet();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const addressData = activeAddress;
      const to = toAddress;
      let suggestedParams = await algod.getTransactionParams().do();

      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: addressData,
        to,
        amount: Number(amountTosend),
        suggestedParams,
      });

      // Sign the transaction
      const signedTxn = await signTransactions([algosdk.encodeUnsignedTransaction(txn)]);

      // Submit the transaction
      const res = await sendTransactions(signedTxn, 4);
      alert(`Transaction successful with ID: ${res.txId}`);
    } catch (error) {
      alert(`An error occurred: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="to">
          From
        </label>
        {activeAddress}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="to">
          To
        </label>
        <input className="w-full" type="text" value={toAddress} onChange={(e) => setToAddress(e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="to">
          Amount (in microAlgos)
        </label>
        <input className="w-full" type="text" value={amountTosend} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <br></br>
      <br></br>
      <Button label="Submit" onClick={handleSubmit} />
    </form>
  );
}

export default SendAlgo;
