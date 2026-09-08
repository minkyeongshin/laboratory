/**
 * Mock data for the Home v2 prototype.
 *
 * Content is static by design — this page is a navigation surface, so there is
 * nothing to fetch. The only runtime read is the active network, which comes
 * from the real Zustand store (see components/NetworkPicker).
 */

import type { StaticImageData } from "next/image";

import { Routes } from "@/constants/routes";

import tutorialCreateAccount from "./assets/tutorial-create-account-light.png";
import tutorialPayments from "./assets/tutorial-payments-light.png";
import tutorialHelloWorld from "./assets/tutorial-hello-world-light.png";
import saveShareComposite from "./assets/save-share-composite-light.png";

export type ImgTheme = "light" | "dark";

/**
 * Theme-keyed image lookup. Mirrors production's `-${imgTheme}` filename
 * convention (see src/components/Home/Networks.tsx), but resolves through a map
 * because these assets are co-located with the prototype rather than served
 * from /public.
 *
 * TODO: dark variants don't exist yet — dark resolves to the light file. When
 * the designer exports them, add the import and change the `dark` value. No
 * consumer needs to change.
 */
export type ThemedImage = Record<ImgTheme, StaticImageData>;

const themed = (light: StaticImageData): ThemedImage => ({
  light,
  dark: light,
});

export type LinkCard = {
  id: string;
  title: string;
  description: string;
  route: string;
};

export const mockStartBuilding: LinkCard[] = [
  {
    id: "fund-account",
    title: "Fund account",
    description: "Fund an account with test assets.",
    route: Routes.ACCOUNT_FUND,
  },
  {
    id: "build-transaction",
    title: "Build a transaction",
    description: "Build, simulate, sign, and submit a transaction.",
    route: Routes.BUILD_TRANSACTION,
  },
  {
    id: "deploy-contract",
    title: "Deploy a smart contract",
    description: "Upload a WASM file and deploy it on Stellar.",
    route: Routes.SMART_CONTRACTS_DEPLOY_CONTRACT,
  },
  {
    id: "sign-message",
    title: "Sign message",
    description: "Sign a message with a Stellar account.",
    route: Routes.SIGN_MESSAGE,
  },
];

// Text-only by design — the illustrations in the earlier Figma export were
// dropped by the designer.
export const mockExploreInspect: LinkCard[] = [
  {
    id: "transactions",
    title: "Transactions",
    description: "Build, simulate, sign, submit, and inspect transactions.",
    route: Routes.TRANSACTION,
  },
  {
    id: "smart-contracts",
    title: "Smart contracts",
    description: "Deploy, explore, and interact with contracts.",
    route: Routes.SMART_CONTRACTS,
  },
  {
    id: "api-explorer",
    title: "API explorer",
    description: "Explore and test Stellar RPC methods and Horizon endpoints.",
    route: Routes.ENDPOINTS,
  },
  {
    id: "xdr-tools",
    title: "XDR tools",
    description: "Decode, encode, and compare Stellar XDR.",
    route: Routes.XDR,
  },
];

export type NetworkCard = {
  /** Matches the store's network id, so the active card can be highlighted. */
  id: string;
  title: string;
  description: string;
  actions: { label: string; url?: string }[];
};

export const mockNetworks: NetworkCard[] = [
  {
    id: "testnet",
    title: "Testnet",
    description: "Safely test transactions without real funds.",
    actions: [{ label: "Switch" }],
  },
  {
    id: "mainnet",
    title: "Mainnet",
    description: "Build, test, and run real transactions on Stellar.",
    actions: [{ label: "Switch" }],
  },
  {
    id: "local",
    title: "Local network",
    description: "Run a local Stellar network for development.",
    actions: [
      { label: "Quickstart", url: "https://github.com/stellar/quickstart" },
      { label: "Stellar CLI", url: "https://github.com/stellar/stellar-cli" },
    ],
  },
];

export const mockTutorials: {
  id: string;
  title: string;
  description: string;
  image: ThemedImage;
  youTubeLink: string;
}[] = [
  {
    id: "create-account",
    title: "Create an account",
    description: "Creates and funds a new Stellar account.",
    image: themed(tutorialCreateAccount),
    youTubeLink: "https://www.youtube.com/watch?v=7j5t69f40dM",
  },
  {
    id: "payments",
    title: "Payments",
    description: "Send an amount in a specific asset to a destination account.",
    image: themed(tutorialPayments),
    youTubeLink: "https://www.youtube.com/watch?v=NsDxKZE5ESY",
  },
  {
    id: "hello-world",
    title: "Hello world",
    description: "Build a contract, deploy it, then invoke a method.",
    image: themed(tutorialHelloWorld),
    youTubeLink: "https://www.youtube.com/watch?v=XcFgR_OHKl8",
  },
];

export const TUTORIALS_PLAYLIST_URL =
  "https://www.youtube.com/playlist?list=PLmr3tp_7-7GiyTrRhKjlznmWe7AqFPq6i";

export const mockSaveAndShare = {
  title: "Save and share your work",
  description:
    "Save transactions and experiments to revisit later or share with others.",
  action: { label: "View saved", route: Routes.SAVED },
  image: themed(saveShareComposite),
};

export type AskStellarAction = {
  id: string;
  label: string;
  variant: "secondary" | "tertiary";
  route?: string;
  url?: string;
};

export type AskStellarReply = {
  body: string;
  actions: AskStellarAction[];
};

/**
 * Canned replies keyed by the exact suggestion text. Still no API — these are
 * hand-written so that clicking a suggestion returns something on-topic
 * instead of the same deploy answer every time. Anything typed freehand falls
 * back to the deploy reply.
 *
 * One sentence per line; the bubble renders with `white-space: pre-wrap`.
 */
export const mockAskStellarReplies: Record<string, AskStellarReply> = {
  "Deploy a smart contract": {
    body: [
      "Compile your contract to a WASM file, then upload it to the network.",
      "Create a deployment transaction and simulate it first to catch errors and estimate resources.",
      "Review the network, contract ID, and required authorization before you sign.",
      "Once it is submitted you can invoke functions, inspect events, and start testing.",
    ].join("\n"),
    actions: [
      {
        id: "deploy",
        label: "Deploy contract",
        variant: "secondary",
        route: Routes.SMART_CONTRACTS_DEPLOY_CONTRACT,
      },
      {
        id: "contract-docs",
        label: "Contract docs",
        variant: "tertiary",
        url: "https://developers.stellar.org/docs/build/smart-contracts",
      },
    ],
  },

  "Explain an XDR": {
    body: [
      "XDR is the binary format Stellar uses to encode transactions, ledger entries, and API responses.",
      "The Lab decodes it to readable JSON so you can inspect envelopes, operations, and results without writing code.",
      "Paste a base64 string and choose its type, or let the Lab work the type out for you.",
      "You can also encode JSON back to XDR, or diff two values to see exactly what changed.",
    ].join("\n"),
    actions: [
      {
        id: "view-xdr",
        label: "View XDR",
        variant: "secondary",
        route: Routes.VIEW_XDR,
      },
      {
        id: "xdr-docs",
        label: "XDR docs",
        variant: "tertiary",
        url: "https://developers.stellar.org/docs/learn/fundamentals/data-format/xdr",
      },
    ],
  },

  "Debug a transaction": {
    body: [
      "Start with the transaction result code — it tells you whether the failure came from the transaction itself or from one of its operations.",
      "A tx_failed result means an operation failed, so check each operation result in turn.",
      "For contract calls, simulate first: simulation surfaces authorization and resource errors before you spend a fee.",
      "Look the hash up in the dashboard to see the full envelope, result, and any events it emitted.",
    ].join("\n"),
    actions: [
      {
        id: "dashboard",
        label: "Transaction dashboard",
        variant: "secondary",
        route: Routes.TRANSACTION_DASHBOARD,
      },
      {
        id: "result-codes",
        label: "Result codes",
        variant: "tertiary",
        url: "https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors/result-codes",
      },
    ],
  },
};

/** Freehand questions get this reply. */
const ASK_STELLAR_FALLBACK_KEY = "Deploy a smart contract";

export const getMockAskStellarReply = (question: string): AskStellarReply =>
  mockAskStellarReplies[question] ??
  mockAskStellarReplies[ASK_STELLAR_FALLBACK_KEY];

// Derived from the replies so the two can't drift apart.
export const mockAskStellarSuggestions = Object.keys(mockAskStellarReplies);
