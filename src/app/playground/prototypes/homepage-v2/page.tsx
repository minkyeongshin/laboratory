"use client";

import { Logo } from "@stellar/design-system";

import { SdsLink } from "@/components/SdsLink";
import { Box } from "@/components/layout/Box";
import { GITHUB_URL } from "@/constants/settings";
import { useStore } from "@/store/useStore";

import { AskStellar } from "./components/AskStellar";
import { AskStellarPill } from "./components/AskStellarPill";
import { ExploreInspect } from "./components/ExploreInspect";
import { Hero } from "./components/Hero";
import { LearnByBuilding } from "./components/LearnByBuilding";
import { NetworkPicker } from "./components/NetworkPicker";
import { SaveAndShare } from "./components/SaveAndShare";
import { SectionHeader } from "./components/SectionHeader";
import { StartBuilding } from "./components/StartBuilding";

import "./styles.scss";

/**
 * Home v2 prototype — a redesign of the Introduction landing page.
 *
 * See README.md for what this proves and what it deliberately skips.
 */
export default function HomepageV2() {
  const { theme } = useStore();

  // Mirrors production's convention in src/app/page.tsx. Dark assets don't
  // exist yet and resolve to the light files — see mock-data.ts.
  const imgTheme = theme === "sds-theme-light" ? "light" : "dark";

  return (
    <Box gap="custom" customValue="48px" addlClassName="HomeV2">
      <Hero />

      <AskStellar />

      <Box gap="custom" customValue="40px">
        <Box gap="custom" customValue="16px">
          <SectionHeader title="Start building" />
          <StartBuilding />
        </Box>

        <Box gap="custom" customValue="16px">
          <SectionHeader title="Explore &amp; inspect" />
          <ExploreInspect />
        </Box>

        <Box gap="custom" customValue="16px">
          <SectionHeader
            title="Network"
            description="Switch between Testnet, Mainnet, or a local network for development."
          />
          <NetworkPicker />
        </Box>

        <Box gap="custom" customValue="16px">
          <SectionHeader
            title="Learn by building"
            description="Step-by-step tutorials to help you get started with Stellar Lab."
          />
          <LearnByBuilding imgTheme={imgTheme} />
        </Box>

        <Box gap="custom" customValue="24px">
          <SaveAndShare imgTheme={imgTheme} />
        </Box>
      </Box>

      <AskStellarPill />

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
