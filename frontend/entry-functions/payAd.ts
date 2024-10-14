import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

const MODULE_ADDRESS = "0x6fab0b20a4153d4bd77046408d2b7f05137e4985f61caa58f38c8d683e08a0d8";
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