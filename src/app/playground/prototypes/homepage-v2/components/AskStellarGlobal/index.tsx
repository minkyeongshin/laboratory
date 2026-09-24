"use client";

import { useEffect, useState } from "react";

import { AskStellarPanel } from "../AskStellarPanel";
import { AskStellarPill } from "../AskStellarPill";
import { useAskStellarStore } from "../../store/askStellarStore";

/**
 * Mounts the Ask Stellar panel and pill app-wide, so a conversation started on
 * the homepage-v2 prototype follows the user onto any route.
 *
 * Rules: not visited -> nothing, visited -> pill, isOpen -> panel too. The pill
 * no longer waits for a first question, because the panel now has an empty
 * state of its own — opening it with no thread is how the suggestions are
 * reached.
 *
 * Renders nothing until mounted. The store rehydrates from sessionStorage at
 * module load, so without this gate the first client render could disagree with
 * the server's (which always sees the empty initial state).
 */
export const AskStellarGlobal = () => {
  const [isMounted, setIsMounted] = useState(false);
  const {
    messages,
    answeredCount,
    isOpen,
    hasVisitedPrototype,
    ask,
    markAnswered,
    close,
    toggle,
  } = useAskStellarStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !hasVisitedPrototype) {
    return null;
  }

  return (
    <>
      {isOpen ? (
        <AskStellarPanel
          messages={messages}
          answeredCount={answeredCount}
          onSend={ask}
          onAnswered={markAnswered}
          onClose={close}
        />
      ) : null}

      <AskStellarPill isPanelOpen={isOpen} onClick={toggle} />
    </>
  );
};
