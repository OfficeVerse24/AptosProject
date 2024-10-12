import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";

export type WriteMessageArguments = {
  content: number; // the content of the message
};

export const writeMessage = (args: WriteMessageArguments): InputTransactionData => {
  const { content } = args;
  return { 
    data: {
      function: `0x1::message_board::post_message`,
      functionArguments: [content],
    },
  };
};
