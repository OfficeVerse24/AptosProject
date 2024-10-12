import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

const MODULE_ADDRESS = "0x8d92d545efc47314646b41e78605061f67268812cc97fd3265a6d0ccc0a5f364";
const MODULE_NAME = "aptosverse";

export type executePayAdArguments = {
  amount: number;
};

export const executePayAd = (args: executePayAdArguments): InputTransactionData => {
  const { amount } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::pay`,
      functionArguments: [amount],
    },
  };
};