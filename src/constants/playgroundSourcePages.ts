/**
 * Mapping of source page keys to their filesystem paths and routes.
 *
 * This is the single source of truth for playground prototype source pages.
 * - `path`: Relative path under src/app/(sidebar)/ (or basePath if specified)
 * - `route`: The URL route for sidebar active state matching
 *
 * Used by:
 * - create-prototype API route (for file copying)
 * - prototype layout (for sidebar active state)
 */
export const SOURCE_PAGE_MAP: Record<
  string,
  {
    path: string;
    route: string;
    basePath?: string;
    hasStyles?: boolean;
    hasComponents?: boolean;
    externalComponents?: string[];
  }
> = {
  // Introduction (special case - at root level, uses Home components)
  introduction: {
    path: "",
    route: "/",
    basePath: "src/app",
    externalComponents: ["Home"],
  },
  // XDR
  "xdr-to-json": { path: "xdr/view", route: "/xdr/view" },
  "xdr-json-to": { path: "xdr/to", route: "/xdr/to" },
  "xdr-diff": { path: "xdr/diff", route: "/xdr/diff" },
  // Account
  "account-create-keypair": { path: "account/create", route: "/account/create" },
  "account-fund": {
    path: "account/fund",
    route: "/account/fund",
    hasComponents: true,
  },
  "account-muxed-create": {
    path: "account/muxed-create",
    route: "/account/muxed-create",
  },
  "account-muxed-parse": {
    path: "account/muxed-parse",
    route: "/account/muxed-parse",
  },
  // Transactions
  "transaction-dashboard": {
    path: "transaction/dashboard",
    route: "/transaction/dashboard",
    hasStyles: true,
    hasComponents: true,
  },
  "transaction-build": {
    path: "transaction/build",
    route: "/transaction/build",
    hasComponents: true,
  },
  "transaction-sign": {
    path: "transaction/sign",
    route: "/transaction/sign",
    hasComponents: true,
  },
  "transaction-fee-bump": {
    path: "transaction/fee-bump",
    route: "/transaction/fee-bump",
  },
  // Smart Contracts
  "contract-explorer": {
    path: "smart-contracts/contract-explorer",
    route: "/smart-contracts/contract-explorer",
    hasComponents: true,
  },
  "contract-list": {
    path: "smart-contracts/contract-list",
    route: "/smart-contracts/contract-list",
    hasComponents: true,
  },
  "contract-deploy": {
    path: "smart-contracts/deploy-contract",
    route: "/smart-contracts/deploy-contract",
  },
};
