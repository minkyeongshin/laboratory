import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Ask Stellar conversation state, persisted for the life of the tab.
 *
 * sessionStorage rather than localStorage is the point: the conversation
 * survives navigation and reload, and dies when the tab or window closes.
 *
 * One key holds everything, including `hasVisitedPrototype` — the flag that
 * gates the global mount in LayoutMain. Keeping it in the same record avoids a
 * second storage mechanism for a single boolean.
 *
 * Follows the same shape as src/store/createTransactionFlowStore.ts, so
 * promoting this out of the playground is a move rather than a rewrite.
 */
const STORAGE_KEY = "lab.playground.askStellar";

type AskStellarState = {
  /** User messages, oldest first. Each is answered by the canned reply. */
  messages: string[];
  /**
   * How many messages have had their reply revealed. Anything beyond this is
   * still "typing". Persisted so a reload mid-reply resumes rather than
   * showing an answer that was never delivered.
   */
  answeredCount: number;
  isOpen: boolean;
  /**
   * Set the first time the homepage-v2 prototype mounts in this tab. Production
   * users who never open the prototype never get the panel or pill.
   */
  hasVisitedPrototype: boolean;

  /** Append a question and open the panel. The reply is not revealed yet. */
  ask: (query: string) => void;
  /** Reveal the reply for everything asked so far. */
  markAnswered: () => void;
  close: () => void;
  toggle: () => void;
  markPrototypeVisited: () => void;
};

export const useAskStellarStore = create<AskStellarState>()(
  persist(
    (set) => ({
      messages: [],
      answeredCount: 0,
      isOpen: false,
      hasVisitedPrototype: false,

      ask: (query) =>
        set((state) => ({
          messages: [...state.messages, query],
          isOpen: true,
        })),
      markAnswered: () =>
        set((state) => ({ answeredCount: state.messages.length })),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      markPrototypeVisited: () => set({ hasVisitedPrototype: true }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      // Matches createTransactionFlowStore: never touch sessionStorage during
      // the server render. Rehydration is triggered explicitly below.
      skipHydration: true,
    },
  ),
);

// Rehydrate once, at module load on the client. Doing it here rather than in a
// component effect avoids a race: child effects run before parent effects, so a
// page marking itself visited would otherwise be overwritten by a later
// rehydrate in the layout.
if (typeof window !== "undefined") {
  void useAskStellarStore.persist.rehydrate();
}
