"use client";

import React from "react";
import {
  prepareContractCall,
  defineChain,
  createThirdwebClient,
  getContract,
} from "thirdweb";
import { baseSepolia as baseSepoliaThirdweb } from "thirdweb/chains";
import {
  useActiveAccount,
  useSendTransaction,
  ConnectButton,
} from "thirdweb/react";
import ORDER_FLOW_ARTIFACT from "./abi.json";

const DIAMOND_ADDRESS = "0x0D905317687273ce6C94874165ca5A62b64Ca69d";
const RPC_URL = NEXT_PUBLIC_TEMPLATE_RPC || "";
const CLIENT_ID = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID || "";

const client = createThirdwebClient({
  clientId: CLIENT_ID,
});

const chain = defineChain({
  id: baseSepoliaThirdweb.id,
  rpc: RPC_URL,
  nativeCurrency: baseSepoliaThirdweb.nativeCurrency,
  testnet: baseSepoliaThirdweb?.testnet,
  blockExplorers: baseSepoliaThirdweb.blockExplorers,
});

const orderFlowContract = getContract({
  client,
  chain,
  address: DIAMOND_ADDRESS,
  abi: ORDER_FLOW_ARTIFACT.abi as readonly any[],
});

export const customPrepareContractCall = async ({
  contract,
  method,
  params,
  address,
}: any) => {
  const estimateTx = prepareContractCall({
    contract: contract,
    method: method,
    params: params,
    extraGas: 50000n,
  });

  return estimateTx;
};

export default function ThirdwebExample() {
  const { mutate: placeOrder } = useSendTransaction();
  const account = useActiveAccount();

  const callContract = async () => {
    const startTime = performance.now();
    const transaction = await customPrepareContractCall({
      contract: orderFlowContract,
      method: "placeOrder",
      params: [
        "c934fc419c3dd6c251e56203e182211674bab7710a49233a338c4cfb24152126c36aaf58cfeae76a4aed5d6722d781db39acbffe2e1464be209884585dbd18a9",
        "1000000",
        "0x4Ca63C2eeEC388E81fEBA004a07b7Db158365EF3",
        0,
        "",
        "",
        "0x42524c0000000000000000000000000000000000000000000000000000000000",
        0,
      ],
      address: account?.address,
    });
    placeOrder(transaction as any, {
      onSuccess: async (result) => {
        const endTimeSuccess = performance.now();
        const durationSuccess = endTimeSuccess - startTime;
        console.log(`Success took ${durationSuccess.toFixed(2)}ms`);
      },
      onError: () => {
        console.log("Error");
      },
    });
  };
  return (
    <div>
      <ConnectButton client={client} chain={chain} />
      <button
        className="rounded-md bg-blue-500 p-2 text-white"
        onClick={callContract}
      >
        Call Contract
      </button>
    </div>
  );
}
