import { useMutation } from "@tanstack/react-query";

import { NetworkHeaders } from "@/types/types";

import { IS_MOCK_MODE } from "@/mocks";
import { getMockSimulateTransactionResponse } from "@/mocks/fixtures/transactions";

type SimulateTxProps = {
  rpcUrl: string;
  transactionXdr: string;
  instructionLeeway?: string;
  headers: NetworkHeaders;
  xdrFormat?: string;
  authMode?: string;
};

export const useSimulateTx = () => {
  const mutation = useMutation({
    mutationFn: async ({
      rpcUrl,
      transactionXdr,
      instructionLeeway,
      headers,
      xdrFormat,
      authMode,
    }: SimulateTxProps) => {
      if (IS_MOCK_MODE) {
        return getMockSimulateTransactionResponse();
      }

      try {
        const res = await fetch(rpcUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "simulateTransaction",
            // TODO: handle CAP-71 v2 auth flag
            params: {
              xdrFormat: xdrFormat || "base64",
              transaction: transactionXdr,
              authMode: authMode || "",
              ...(instructionLeeway
                ? {
                    resourceConfig: {
                      instructionLeeway: Number(instructionLeeway),
                    },
                  }
                : {}),
            },
          }),
        });

        return await res.json();
      } catch (e) {
        throw {
          result: e,
        };
      }
    },
  });

  return mutation;
};
