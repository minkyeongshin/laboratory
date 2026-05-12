import { NetworkHeaders } from "@/types/types";
import { rpc as StellarRpc } from "@stellar/stellar-sdk";

import { useQuery } from "@tanstack/react-query";

import { IS_MOCK_MODE } from "@/mocks";
import { getMockLatestLedger } from "@/mocks/fixtures/ledger";

export const useLatestLedger = ({
  rpcUrl,
  headers,
}: {
  rpcUrl: string;
  headers: NetworkHeaders;
}) => {
  const query = useQuery({
    queryKey: ["latestLedger"],
    queryFn: async () => {
      if (IS_MOCK_MODE) {
        return getMockLatestLedger();
      }

      const rpcServer = new StellarRpc.Server(rpcUrl, {
        headers,
        allowHttp: new URL(rpcUrl).hostname === "localhost",
      });

      try {
        const latestLedger = await rpcServer.getLatestLedger();
        return latestLedger.sequence;
      } catch (error) {
        throw `there was an error with fetching latest ledger. e: ${error}`;
      }
    },
    enabled: false,
  });

  return query;
};
