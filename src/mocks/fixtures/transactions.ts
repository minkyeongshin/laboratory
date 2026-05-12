/**
 * Mock transaction simulation fixtures.
 *
 * The useSimulateTx hook does a raw JSON-RPC fetch to the RPC endpoint
 * and returns the full JSON-RPC response wrapper containing the simulation result.
 *
 * Uses Api.RawSimulateTransactionResponse from @stellar/stellar-sdk for type parity.
 */

import { rpc } from "@stellar/stellar-sdk";

/**
 * JSON-RPC response wrapper shape.
 * This is what the raw fetch returns before SDK parsing.
 */
export interface JsonRpcResponse<T> {
  jsonrpc: "2.0";
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * The full response type returned by useSimulateTx mutation.
 */
export type SimulateTxResponse = JsonRpcResponse<rpc.Api.RawSimulateTransactionResponse>;

/**
 * Creates a mock successful simulation response.
 * Matches the exact shape returned by the RPC simulateTransaction endpoint.
 *
 * @returns JSON-RPC wrapped simulation response
 */
export const getMockSimulateTransactionResponse = (): SimulateTxResponse => {
  const result: rpc.Api.RawSimulateTransactionResponse = {
    id: "1",
    latestLedger: 50000000,
    // Base64-encoded SorobanTransactionData
    transactionData:
      "AAAAAAAAAAIAAAAGAAAAAcnkMNLkhJLoaWVdTzN6F3CVlW4vN7N9C7LK6Uul7hxnAAAAFAAAAAEAAAAHAAAAAcnkMNLkhJLoaWVdTzN6F3CVlW4vN7N9C7LK6Uul7hxnAAAAAAAAABcAAAAAAAAACgAAAAAAAAAAAAAAAAAAAA==",
    minResourceFee: "100000",
    events: [],
    results: [
      {
        // Base64-encoded ScVal (void return)
        xdr: "AAAAEQAAAAEAAAACAAAADwAAAAVIZWxsbwAAAAAAAA8AAAAFd29ybGQAAAA=",
        auth: [],
      },
    ],
  };

  return {
    jsonrpc: "2.0",
    id: 1,
    result,
  };
};

/**
 * Creates a mock failed simulation response with an error.
 *
 * @param errorMessage - The error message to include
 * @returns JSON-RPC wrapped simulation error response
 */
export const getMockSimulateTransactionError = (
  errorMessage = "HostError: Error(Contract, #1)",
): SimulateTxResponse => {
  const result: rpc.Api.RawSimulateTransactionResponse = {
    id: "1",
    latestLedger: 50000000,
    error: errorMessage,
    events: [],
  };

  return {
    jsonrpc: "2.0",
    id: 1,
    result,
  };
};
