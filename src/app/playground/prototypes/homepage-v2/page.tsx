"use client";

import { Logo, Text } from "@stellar/design-system";

import { SdsLink } from "@/components/SdsLink";
import { Box } from "@/components/layout/Box";
import { GITHUB_URL } from "@/constants/settings";

import { CardGrid } from "./components/CardGrid";
import { SectionHeader } from "./components/SectionHeader";

import "./styles.scss";

/**
 * Home v2 prototype.
 *
 * Skeleton stage: every section is present and laid out, but sections 1-8 are
 * placeholders until their components land. See README.md for scope.
 */

// Temporary stand-in so the page's spacing and the CardGrid dividers can be
// reviewed before real content exists. Removed section by section.
const Placeholder = ({ label }: { label: string }) => (
  <Text as="div" size="sm" addlClassName="HomeV2__placeholder">
    {label}
  </Text>
);

export default function HomepageV2() {
  return (
    <Box gap="custom" customValue="48px" addlClassName="HomeV2">
      {/* 1 — Hero */}
      <Box gap="custom" customValue="24px">
        <Placeholder label="§1 Hero — heading + subtitle" />
      </Box>

      {/* 2 — Ask Stellar */}
      <Placeholder label="§2 Ask Stellar — label, input, suggestions" />

      {/* Sections 3-7 */}
      <Box gap="custom" customValue="40px">
        {/* 3 — Start building */}
        <Box gap="custom" customValue="16px">
          <SectionHeader title="Start building" />
          <CardGrid columns={4}>
            <CardGrid.Cell>
              <Placeholder label="Fund account" />
            </CardGrid.Cell>
            <CardGrid.Cell>
              <Placeholder label="Build a transaction" />
            </CardGrid.Cell>
            <CardGrid.Cell>
              <Placeholder label="Deploy a smart contract" />
            </CardGrid.Cell>
            <CardGrid.Cell>
              <Placeholder label="Sign message" />
            </CardGrid.Cell>
          </CardGrid>
        </Box>

        {/* 4 — Explore & inspect */}
        <Box gap="custom" customValue="16px">
          <SectionHeader title="Explore &amp; inspect" />
          <CardGrid columns={4}>
            <CardGrid.Cell>
              <Placeholder label="Transactions" />
            </CardGrid.Cell>
            <CardGrid.Cell>
              <Placeholder label="Smart contracts" />
            </CardGrid.Cell>
            <CardGrid.Cell>
              <Placeholder label="API explorer" />
            </CardGrid.Cell>
            <CardGrid.Cell>
              <Placeholder label="XDR tools" />
            </CardGrid.Cell>
          </CardGrid>
        </Box>

        {/* 5 — Network */}
        <Box gap="custom" customValue="16px">
          <SectionHeader
            title="Network"
            description="Switch between Testnet, Mainnet, or a local network for development."
          />
          <CardGrid columns={3}>
            <CardGrid.Cell>
              <Placeholder label="Testnet" />
            </CardGrid.Cell>
            <CardGrid.Cell>
              <Placeholder label="Mainnet" />
            </CardGrid.Cell>
            <CardGrid.Cell>
              <Placeholder label="Local network" />
            </CardGrid.Cell>
          </CardGrid>
        </Box>

        {/* 6 — Learn by building */}
        <Box gap="custom" customValue="16px">
          <SectionHeader
            title="Learn by building"
            description="Step-by-step tutorials to help you get started with Stellar Lab."
          />
          <CardGrid columns={3}>
            <CardGrid.Cell>
              <Placeholder label="Create an account" />
            </CardGrid.Cell>
            <CardGrid.Cell>
              <Placeholder label="Payments" />
            </CardGrid.Cell>
            <CardGrid.Cell>
              <Placeholder label="Hello world" />
            </CardGrid.Cell>
          </CardGrid>
          <Placeholder label="View all tutorials →" />
        </Box>

        {/* 7 — Save and share */}
        <Box gap="custom" customValue="24px">
          <Placeholder label="§7 Save and share your work" />
        </Box>
      </Box>

      {/* 8 — Floating Ask Stellar pill */}
      <Placeholder label="§8 Floating Ask Stellar pill (fixed bottom-right)" />

      {/*
        Footer. Copied verbatim from src/app/page.tsx — there is no shared
        Footer component in the codebase, and the playground's "full" chrome
        renders header + sidebar only. Extracting one would be a production
        refactor, out of scope for this prototype.
      */}
      <Box
        gap="md"
        wrap="wrap"
        direction="row"
        align="end"
        justify="space-between"
        addlClassName="HomeV2__footer"
      >
        <Box gap="sm" direction="row">
          <SdsLink
            href="https://www.stellar.org/privacy-policy"
            variant="secondary"
          >
            Privacy Policy
          </SdsLink>
          <SdsLink
            href="https://www.stellar.org/terms-of-service"
            variant="secondary"
          >
            Terms of Service
          </SdsLink>
        </Box>

        <Box gap="sm" direction="row">
          <>
            {process.env.NEXT_PUBLIC_COMMIT_HASH ? (
              <div>{`Commit hash: ${process.env.NEXT_PUBLIC_COMMIT_HASH}`}</div>
            ) : null}

            <SdsLink
              addlClassName="Link--withLogo"
              href={GITHUB_URL}
              variant="secondary"
              icon={<Logo.Github />}
            />
          </>
        </Box>
      </Box>
    </Box>
  );
}
