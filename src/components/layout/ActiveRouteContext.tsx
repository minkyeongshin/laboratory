"use client";

import { createContext } from "react";

/**
 * Context for overriding the active route in the sidebar.
 *
 * When set, NavLink components will use this value instead of usePathname()
 * to determine active state. This is used by playground prototypes to highlight
 * the nav item matching the page they were created from.
 *
 * @example
 * // In a layout that wants to override the active route:
 * <ActiveRouteContext.Provider value="/transaction/build">
 *   <LayoutSidebarContent>{children}</LayoutSidebarContent>
 * </ActiveRouteContext.Provider>
 */
export const ActiveRouteContext = createContext<string | null>(null);
