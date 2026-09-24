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
// 3x export (1773x537) rendered at 591x179 CSS, so it stays sharp on retina.
import saveShareComposite from "./assets/save-share-composite-light@3x.png";

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
    description: "Fund a test account.",
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
    // Trailing "transactions" dropped — the title already says it, and at the
    // 203px column the full phrase ran to a third line.
    description: "Build, sign, submit, and inspect.",
    route: Routes.TRANSACTION,
  },
  {
    id: "smart-contracts",
    title: "Smart contracts",
    description: "Deploy, explore, and call contracts.",
    route: Routes.SMART_CONTRACTS,
  },
  {
    id: "api-explorer",
    title: "API explorer",
    description: "Test Stellar RPC and Horizon endpoints.",
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

/** One cited source, shown as a badge on a paragraph and a row in its popover. */
export type AskStellarSource = {
  id: string;
  /** Site name. Also the badge label when this is a paragraph's first source. */
  title: string;
  /** One line, ellipsised in the popover. */
  description: string;
  url: string;
};

/**
 * A link inside a paragraph. `label` must appear verbatim in the paragraph's
 * text — the panel splits on it rather than storing the copy pre-segmented, so
 * the text stays readable and translatable here.
 */
export type AskStellarInlineLink = {
  label: string;
  route?: string;
  url?: string;
};

export type AskStellarParagraph = {
  text: string;
  links?: AskStellarInlineLink[];
  /** Rendered as one badge after the last word; the popover lists them all. */
  sources?: AskStellarSource[];
};

export type AskStellarReply = {
  paragraphs: AskStellarParagraph[];
};

// The two sources behind every badge in the Figma frames. Shared rather than
// repeated so the popover rows stay identical wherever a badge is opened.
const SOURCE_DEV_DOCS: AskStellarSource = {
  id: "dev-docs",
  title: "Developer docs",
  description: "Fund account on Testnet",
  url: "https://developers.stellar.org/docs/build/smart-contracts",
};

const SOURCE_LAB: AskStellarSource = {
  id: "lab",
  title: "Stellar Lab",
  description: "Fund a Testnet account or Contract with XLM, USDC",
  url: "https://lab.stellar.org/account/fund",
};

/**
 * Canned replies keyed by the exact suggestion text, so clicking a suggestion
 * returns something on topic. Anything typed freehand falls back to the deploy
 * reply — including "How do I deploy a smart contract from Lab?", the sample
 * question in the Figma frames.
 *
 * Copy is verbatim from the Figma Answer (9569:203) and Long answer (9569:3129)
 * frames, with one exception noted below. Still no API.
 */
export const mockAskStellarReplies: Record<string, AskStellarReply> = {
  // Short shape: two paragraphs, one badge. Matches the Answer frame's layout.
  "How do I create a transaction?": {
    paragraphs: [
      {
        text: "Use Build a transaction under Transactions: set the source account, sequence number, and fee, then add the operations you want the transaction to carry.",
        links: [
          { label: "Build a transaction", route: Routes.BUILD_TRANSACTION },
          { label: "Transactions", route: Routes.TRANSACTION },
        ],
        sources: [SOURCE_DEV_DOCS],
      },
      {
        text: "Simulate it before you sign to catch errors and estimate resources, then sign and submit. Want the steps?",
      },
    ],
  },

  // Long shape: four paragraphs, badges on the first and last. Matches the Long
  // answer frame, which is the same question rendered past the scroll point.
  "How do I deploy a smart contract?": {
    paragraphs: [
      {
        text: "Use Upload and deploy contract under Smart contracts: it lets you choose a WASM file, build the upload transaction, add a signature, then build and sign the deploy transaction.",
        links: [
          {
            label: "Upload and deploy contract",
            route: Routes.SMART_CONTRACTS_DEPLOY_CONTRACT,
          },
          { label: "Smart contracts", route: Routes.SMART_CONTRACTS },
        ],
        sources: [SOURCE_DEV_DOCS],
      },
      {
        text: "It also lets you create account keypairs, fund test accounts, create and parse muxed accounts, import transactions, fee-bump transactions, sign messages, connect a wallet, and save transactions, keypairs, requests, and smart contracts locally in your browser. If you want, I can point you to the right Lab page for a specific task.",
      },
      // The Figma frame repeats the paragraph above verbatim here, which reads
      // as filler to push the frame past its scroll point rather than as copy.
      // Replaced with an on-topic paragraph that does the same job.
      {
        text: "Simulation runs before either signature, so authorization and resource errors surface before you spend a fee. The contract ID is returned by the deploy transaction, and you can invoke functions against it from Contract explorer straight afterwards.",
        links: [
          {
            label: "Contract explorer",
            route: Routes.SMART_CONTRACTS_CONTRACT_EXPLORER,
          },
        ],
      },
      {
        // The Figma copy splices the Testnet and Mainnet halves together with a
        // comma; the missing full stop is being fixed in the file separately.
        text: "If you need an account first on Testnet, you can fund it on Fund Account. On Mainnet, real funds move and transactions can’t be reversed. Want the steps?",
        links: [{ label: "Fund Account", route: Routes.ACCOUNT_FUND }],
        sources: [SOURCE_DEV_DOCS, SOURCE_LAB],
      },
    ],
  },

  "What can I build with Stellar?": {
    paragraphs: [
      {
        text: "Payments, asset issuance, and smart contracts, all on the same ledger: classic operations settle in about five seconds, and Soroban contracts run alongside them in Rust.",
        sources: [SOURCE_DEV_DOCS],
      },
      {
        text: "The Lab lets you create account keypairs, fund test accounts, create and parse muxed accounts, import transactions, fee-bump transactions, sign messages, connect a wallet, and save transactions, keypairs, requests, and smart contracts locally in your browser. If you want, I can point you to the right Lab page for a specific task.",
      },
    ],
  },
};

/** Freehand questions, and the Figma sample question, get this reply. */
const ASK_STELLAR_FALLBACK_KEY = "How do I deploy a smart contract?";

export const getMockAskStellarReply = (question: string): AskStellarReply =>
  mockAskStellarReplies[question] ??
  mockAskStellarReplies[ASK_STELLAR_FALLBACK_KEY];

// Derived from the replies so the two can't drift apart. Drives both the
// homepage compose box's chips and the panel's empty state.
export const mockAskStellarSuggestions = Object.keys(mockAskStellarReplies);
