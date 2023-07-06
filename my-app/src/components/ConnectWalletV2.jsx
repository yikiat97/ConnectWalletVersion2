import React, { useState } from 'react';
import { useWallet } from "@txnlab/use-wallet";
import axios from 'axios';
const algosdk = require('algosdk');
import { getAlgodClient } from "../clients";

const network = process.env.NEXT_PUBLIC_NETWORK || "SandNet";
const algod = getAlgodClient(network);

function SendAlgo() {
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [amountTosend, setAmount] = useState('');
  const { activeAddress, signTransactions, sendTransactions,signer } = useWallet();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const addressData = activeAddress;
        const to = toAddress;
        const amount = 1;
        
        let suggestedParams = await algod.getTransactionParams().do();
        
          const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            from: addressData,
            to,
            amount,
            suggestedParams,
          });
  
          // Sign the transaction
          const signedTxn = await signTransactions([algosdk.encodeUnsignedTransaction(txn)]);
      
          // Submit the transaction
          const res = await sendTransactions(signedTxn, 4);
          console.log(res)
        
      alert(`Transaction successful with ID: `);
    } catch (error) {
      alert(`An error occurred: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        <p>From Address: </p>
        <input type="text" value={activeAddress} onChange={e => setFromAddress(e.target.value)} />
      </label>
      <label>
      <p>To Address: </p>
        <input type="text" value={toAddress} onChange={e => setToAddress(e.target.value)} />
      </label>
      <label>
      <p> Amount (in microAlgos):</p>
        <input type="text" value={amountTosend} onChange={e => setAmount(e.target.value)} />
      </label>
      <br></br>
      <br></br>
      <button style={{ 
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '15px 32px',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '16px',
    margin: '4px 2px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '4px'
  }} type="submit">Send Algo</button>
    </form>
  );
}

export default SendAlgo;
