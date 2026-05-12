/**
 * Mock wallet configuration for prototyping.
 *
 * Provides a pre-connected wallet state so designers can prototype
 * wallet-dependent features without connecting a real wallet.
 */

import { WalletKit } from "@/store/createStore";

/**
 * A realistic-looking Stellar public key for mock wallet.
 * This is a valid format but not a real funded account.
 */
export const MOCK_WALLET_PUBLIC_KEY =
  "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3HTBFKX5DY4E";

/**
 * Mock wallet state to inject when IS_MOCK_MODE is true.
 * Simulates a connected Freighter wallet.
 */
export const MOCK_WALLET_STATE: WalletKit = {
  publicKey: MOCK_WALLET_PUBLIC_KEY,
  walletType: "FREIGHTER",
};
