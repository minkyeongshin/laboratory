"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import {
  ProjectLogo,
  ThemeSwitch,
  Button,
  Card,
  Text,
} from "@stellar/design-system";

import { Tabs } from "@/components/Tabs";

import { useStore } from "@/store/useStore";
import { WindowContext } from "@/components/layout/LayoutContextProvider";
import { Hydration } from "@/components/Hydration";
import { Box } from "@/components/layout/Box";

import { LOCAL_STORAGE_SAVED_THEME } from "@/constants/settings";
import { ThemeColorType } from "@/types/types";

import { CopyPill } from "./components/CopyPill";
import "./styles.scss";

const TABS = [
  { id: "soroban", label: "Soroban" },
  { id: "frontend", label: "Front end" },
  { id: "assets", label: "Assets" },
  { id: "apis", label: "APIs" },
  { id: "security", label: "Security" },
  { id: "standard", label: "Standard" },
  { id: "zk-ecosystem", label: "ZK ecosystem" },
];

const generatePlaceholderCards = (tabId: string) => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `${tabId}-card-${i + 1}`,
    title: `Placeholder Title ${i + 1}`,
    description: "Placeholder description for this skill card.",
    path: `stellarskills.com/skills/${tabId}/placeholder-${i + 1}.md`,
  }));
};

export default function StellarSkillsDemo() {
  const { layoutMode } = useContext(WindowContext);
  const { setTheme } = useStore();
  const [activeTab, setActiveTab] = useState("soroban");

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

  const cards = generatePlaceholderCards(activeTab);

  return (
    <div className="LabLayout LabLayout--minimal">
      <div className="LabLayout__header">
        <header className="LabLayout__header__main">
          <Box
            gap="md"
            direction="row"
            align="center"
            addlClassName="LabLayout__header__left"
          >
            <ProjectLogo
              title="Skills"
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
            <Button
              variant="tertiary"
              size="md"
              onClick={() =>
                window.open("https://developers.stellar.org", "_blank")
              }
            >
              Developer Docs
            </Button>
          </div>
        </header>
      </div>

      <div className="StellarSkillsDemo">
        <div className="StellarSkillsDemo__content">
          <h1>Work with any AI agent</h1>

          <Tabs
            tabs={TABS}
            activeTabId={activeTab}
            onChange={setActiveTab}
          />

          <div className="StellarSkillsDemo__cards">
            {cards.map((card) => (
              <Card key={card.id}>
                <div className="StellarSkillsDemo__card">
                  <Text as="h3" size="md">
                    {card.title}
                  </Text>
                  <Text as="p" size="sm">
                    {card.description}
                  </Text>
                  <CopyPill text={card.path} variant="path" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
