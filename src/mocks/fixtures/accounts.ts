/**
 * Mock account data fixtures.
 *
 * Uses the exact types from @stellar/stellar-sdk to ensure type parity
 * with real Horizon responses.
 */

import { Horizon } from "@stellar/stellar-sdk";
import { MOCK_WALLET_PUBLIC_KEY } from "../mockWallet";

/**
 * The return type of useAccountInfo hook.
 * Matches the exact shape returned by the hook.
 */
export type AccountInfoResult =
  | {
      id: string;
      isFunded: false;
    }
  | {
      id: string;
      isFunded: true;
      details: Horizon.HorizonApi.AccountResponse;
    };

/**
 * Creates a mock account info response matching useAccountInfo's return shape.
 *
 * @param publicKey - The account's public key
 * @returns Account info matching useAccountInfo's exact return type
 */
export const getMockAccountInfo = (publicKey: string): AccountInfoResult => {
  // Return funded account for mock wallet, unfunded for others
  const isMockWallet = publicKey === MOCK_WALLET_PUBLIC_KEY;

  if (!isMockWallet) {
    return {
      id: publicKey,
      isFunded: false,
    };
  }

  // Full HorizonApi.AccountResponse shape for funded accounts
  const details: Horizon.HorizonApi.AccountResponse = {
    _links: {
      self: {
        href: `https://horizon-testnet.stellar.org/accounts/${publicKey}`,
      },
      transactions: {
        href: `https://horizon-testnet.stellar.org/accounts/${publicKey}/transactions{?cursor,limit,order}`,
        templated: true,
      },
      operations: {
        href: `https://horizon-testnet.stellar.org/accounts/${publicKey}/operations{?cursor,limit,order}`,
        templated: true,
      },
      payments: {
        href: `https://horizon-testnet.stellar.org/accounts/${publicKey}/payments{?cursor,limit,order}`,
        templated: true,
      },
      effects: {
        href: `https://horizon-testnet.stellar.org/accounts/${publicKey}/effects{?cursor,limit,order}`,
        templated: true,
      },
      offers: {
        href: `https://horizon-testnet.stellar.org/accounts/${publicKey}/offers{?cursor,limit,order}`,
        templated: true,
      },
      trades: {
        href: `https://horizon-testnet.stellar.org/accounts/${publicKey}/trades{?cursor,limit,order}`,
        templated: true,
      },
      data: {
        href: `https://horizon-testnet.stellar.org/accounts/${publicKey}/data/{key}`,
        templated: true,
      },
    },
    id: publicKey,
    paging_token: publicKey,
    account_id: publicKey,
    sequence: "1234567890",
    sequence_ledger: 50000000,
    sequence_time: "1699900000",
    subentry_count: 1,
    last_modified_ledger: 50000000,
    last_modified_time: new Date().toISOString(),
    thresholds: {
      low_threshold: 0,
      med_threshold: 0,
      high_threshold: 0,
    },
    flags: {
      auth_required: false,
      auth_revocable: false,
      auth_immutable: false,
      auth_clawback_enabled: false,
    },
    balances: [
      {
        balance: "10000.0000000",
        buying_liabilities: "0.0000000",
        selling_liabilities: "0.0000000",
        asset_type: "native" as const,
      },
    ],
    signers: [
      {
        key: publicKey,
        weight: 1,
        type: "ed25519_public_key",
      },
    ],
    data: {},
    num_sponsoring: 0,
    num_sponsored: 0,
  };

  return {
    id: publicKey,
    isFunded: true,
    details,
  };
};
