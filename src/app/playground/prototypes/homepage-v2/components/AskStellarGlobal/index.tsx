"use client";

import { useEffect, useState } from "react";

import { AskStellarPanel } from "../AskStellarPanel";
import { AskStellarPill } from "../AskStellarPill";
import { useAskStellarStore } from "../../store/askStellarStore";

/**
 * Mounts the Ask Stellar panel and pill app-wide, so a conversation started on
 * the homepage-v2 prototype follows the user onto any route.
 *
 * Rules are unchanged from when this lived in the prototype's page:
 *   no conversation -> nothing, conversation -> pill, isOpen -> panel too.
 *
 * Renders nothing until mounted. The store rehydrates from sessionStorage at
 * module load, so without this gate the first client render could disagree with
 * the server's (which always sees the empty initial state).
 */
export const AskStellarGlobal = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { messages, isOpen, hasVisitedPrototype, ask, close, toggle } =
    useAskStellarStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !hasVisitedPrototype || messages.length === 0) {
    return null;
  }

  return (
    <>
      {isOpen ? (
        <AskStellarPanel messages={messages} onSend={ask} onClose={close} />
      ) : null}

      <AskStellarPill isPanelOpen={isOpen} onClick={toggle} />
    </>
  );
};
