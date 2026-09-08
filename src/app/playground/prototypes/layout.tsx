"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { LayoutHeader } from "@/components/layout/LayoutHeader";
import { LayoutHeaderMinimal } from "@/components/layout/LayoutHeaderMinimal";
import { LayoutWithSidebar } from "@/components/layout/LayoutWithSidebar";
import { LayoutSidebarContent } from "@/components/layout/LayoutSidebarContent";
import { ActiveRouteContext } from "@/components/layout/ActiveRouteContext";
import { Hydration } from "@/components/Hydration";
import { SOURCE_PAGE_MAP } from "@/constants/playgroundSourcePages";

type ChromeMode = "none" | "minimal" | "full" | null;

/**
 * Layout for prototype pages that renders Lab chrome based on prototype type.
 *
 * - None (chrome: "none"): No Lab chrome, prototype manages its own header/layout
 * - Minimal prototypes (chrome: "minimal"): Logo + theme + wallet only, no sidebar
 * - Existing-page prototypes (chrome: "full"): Full header + sidebar
 *
 * The chrome mode is determined by reading the prototype's metadata.json file.
 */
export default function PrototypesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [chromeMode, setChromeMode] = useState<ChromeMode>(null);
  const [activeRoute, setActiveRoute] = useState<string | null>(null);

  // Extract the prototype slug from the pathname
  // /playground/prototypes/my-prototype → my-prototype
  const slug = pathname?.split("/playground/prototypes/")[1]?.split("/")[0];

  useEffect(() => {
    if (!slug) {
      setChromeMode("full"); // Default
      return;
    }

    // Fetch metadata to determine chrome mode and active route
    fetch(`/api/playground/prototype-metadata?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => {
        setChromeMode(data.chrome || "full");

        // Set active route from startedFrom field
        if (data.startedFrom && SOURCE_PAGE_MAP[data.startedFrom]) {
          setActiveRoute(SOURCE_PAGE_MAP[data.startedFrom].route);
        }
      })
      .catch(() => {
        setChromeMode("full"); // Default on error
      });
  }, [slug]);

  // Show nothing while loading to prevent layout shift
  if (chromeMode === null) {
    return null;
  }

  // No chrome: prototype manages its own header/layout entirely
  if (chromeMode === "none") {
    return <>{children}</>;
  }

  // Minimal chrome: header only (no sidebar toggle, no network selector, no sidebar)
  if (chromeMode === "minimal") {
    return (
      <div className="LabLayout LabLayout--minimal">
        <LayoutHeaderMinimal />
        <div className="LabLayout__container LabLayout__container--full">
          <div className="LabLayout__content">{children}</div>
        </div>
      </div>
    );
  }

  // Full chrome: header + sidebar
  return (
    <div className="LabLayout">
      <LayoutHeader />
      <Hydration>
        <ActiveRouteContext.Provider value={activeRoute}>
          <LayoutWithSidebar>
            <LayoutSidebarContent>{children}</LayoutSidebarContent>
          </LayoutWithSidebar>
        </ActiveRouteContext.Provider>
      </Hydration>
    </div>
  );
}
