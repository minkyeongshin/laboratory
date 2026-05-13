"use client";

import { useContext, useEffect } from "react";
import Link from "next/link";
import { ProjectLogo, ThemeSwitch } from "@stellar/design-system";

import { useStore } from "@/store/useStore";
import { WindowContext } from "@/components/layout/LayoutContextProvider";
import { Hydration } from "@/components/Hydration";
import { Box } from "@/components/layout/Box";
import { ConnectWallet } from "@/components/WalletKit/ConnectWallet";

import { LOCAL_STORAGE_SAVED_THEME } from "@/constants/settings";
import { ThemeColorType } from "@/types/types";

/**
 * Minimal header for blank prototypes.
 * Shows only: Logo, Theme switch, Connect wallet.
 * No sidebar toggle, no network selector.
 */
export const LayoutHeaderMinimal = () => {
  const { layoutMode } = useContext(WindowContext);
  const { setTheme } = useStore();

  // Make sure we always have the theme set in the store
  useEffect(() => {
    const attr = "data-sds-theme";
    const getVal = () => document.body.getAttribute(attr);

    const currentTheme = getVal();

    if (currentTheme) {
      setTheme(currentTheme as ThemeColorType);
      return;
    }

    const observer = new MutationObserver(() => {
      const theme = getVal();

      if (theme) {
        observer.disconnect();
        setTheme(theme as ThemeColorType);
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: [attr],
    });

    return () => {
      observer.disconnect();
    };
  }, [setTheme]);

  const renderTheme = (isDarkMode: boolean) => {
    const theme = isDarkMode ? "sds-theme-dark" : "sds-theme-light";
    setTheme(theme);
  };

  if (!layoutMode) {
    return null;
  }

  return (
    <div className="LabLayout__header">
      <header className="LabLayout__header__main">
        <Box
          gap="md"
          direction="row"
          align="center"
          addlClassName="LabLayout__header__left"
        >
          <ProjectLogo
            title="Lab"
            link="/"
            customAnchor={<Link href="/" prefetch={true} />}
          />
        </Box>

        <div className="LabLayout__header__settings">
          <Hydration>
            <ThemeSwitch
              storageKeyId={LOCAL_STORAGE_SAVED_THEME}
              onActionEnd={renderTheme}
            />
          </Hydration>
          <ConnectWallet />
        </div>
      </header>
    </div>
  );
};
