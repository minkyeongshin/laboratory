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

export const mockAskStellarSuggestions = [
  "Deploy a smart contract",
  "Explain an XDR",
  "Debug a transaction",
];

/**
 * The single canned assistant reply, taken from the Figma frame's
 * deploy-contract conversation. Every question gets this answer — the panel is
 * a visual prototype with no API behind it, so the response does not vary.
 */
export const mockAskStellarReply = [
  "Deploy a smart contract on Stellar, first compile your contract into a WASM file.",
  "Then create a deployment transaction and simulate it to check for errors.",
  "Review the transaction details, including the network, contract ID, and required auth.",
  "Sign and submit the transaction with your connected wallet to deploy the contract.",
  "After deployment, you can invoke functions, inspect events, and start testing interactions.",
].join("\n");

export const mockAskStellarActions: {
  id: string;
  label: string;
  variant: "secondary" | "tertiary";
  route?: string;
  url?: string;
}[] = [
  {
    id: "deploy",
    label: "Deploy contract",
    variant: "secondary",
    route: Routes.SMART_CONTRACTS_DEPLOY_CONTRACT,
  },
  {
    id: "docs",
    label: "Developer docs",
    variant: "tertiary",
    url: "https://developers.stellar.org/",
  },
];
