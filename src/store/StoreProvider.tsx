"use client";
import { createContext, ReactNode, useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { createStore } from "@/store/createStore";

import { logMockModeStatus } from "@/mocks";

export type StoreType = ReturnType<typeof createStore>;
export const ZustandContext = createContext<StoreType | null>(null);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const url = `${pathname}?${searchParams}`;

  const [store] = useState(() =>
    createStore({
      url,
    }),
  );

  // Log mock mode status on initial mount
  useEffect(() => {
    logMockModeStatus();
  }, []);

  return (
    <ZustandContext.Provider value={store}>{children}</ZustandContext.Provider>
  );
};
