import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";

import { createKeyPairSignerFromBytes } from "@solana/kit";
import { Keypair } from "@solana/web3.js";
import { base58 } from "@scure/base";
import dotenv from "dotenv";
dotenv.config();

const baseUrl = "http://localhost:4021";
async function main() {
  const signer = Keypair.fromSecretKey(base58.decode(process.env.BUYER_PRIVATE_KEY!));
  const signerForFetch = await createKeyPairSignerFromBytes(signer.secretKey);

  const fetchWithPayment = wrapFetchWithPayment(fetch, signerForFetch);

  fetchWithPayment(`${baseUrl}/weather`, {
    //url should be something like https://api.example.com/paid-endpoint
    method: "GET",
  })
    .then(async (response) => {
      const body = await response.json();
      console.log(body);

      const paymentResponse = decodeXPaymentResponse(
        response.headers.get("x-payment-response")!
      );
      console.log(paymentResponse);
    })
    .catch((error) => {
      console.log(error);
    });
}

main();