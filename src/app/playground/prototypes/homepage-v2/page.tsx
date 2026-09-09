"use client";

import { useEffect } from "react";
import { Logo } from "@stellar/design-system";

import { SdsLink } from "@/components/SdsLink";
import { Box } from "@/components/layout/Box";
import { GITHUB_URL } from "@/constants/settings";
import { useStore } from "@/store/useStore";

import { AskStellar } from "./components/AskStellar";
import { ExploreInspect } from "./components/ExploreInspect";
import { useAskStellarStore } from "./store/askStellarStore";
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

  // The conversation lives in a sessionStorage-backed store so it follows the
  // user off this page. The panel and pill are mounted app-wide by
  // AskStellarGlobal (see LayoutMain); this page only writes to the store.
  const { ask, markPrototypeVisited } = useAskStellarStore();

  // Opens the gate for the app-wide mount. Until the prototype has been visited
  // in this tab, production routes render nothing.
  useEffect(() => {
    markPrototypeVisited();
  }, [markPrototypeVisited]);

  return (
    <div className="HomeV2">
      {/* 96px between the hero block and the first section — the largest gap
          on the page, marking the hero/content boundary. */}
      <Box gap="custom" customValue="96px" addlClassName="HomeV2__column">
        {/* Ask Stellar is the hero's CTA, so it's grouped with the heading at
            a tighter 40px. The 48px below still separates the block from the
            first section. */}
        <Box gap="custom" customValue="40px">
          <Hero />

          <AskStellar onSubmit={ask} />
        </Box>

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
      </Box>

      {/*
        Footer. Copied verbatim from src/app/page.tsx — there is no shared
        Footer component in the codebase, and the playground's "full" chrome
        renders header + sidebar only. Extracting one would be a production
        refactor, out of scope for this prototype.

        Sits outside __column deliberately: the export's footer spans the full
        content area, not the 960 column.
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
    </div>
  );
}
