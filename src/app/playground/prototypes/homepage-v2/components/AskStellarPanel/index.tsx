"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, Icon, Text } from "@stellar/design-system";

import { openUrl } from "@/helpers/openUrl";

import { getMockAskStellarReply } from "../../mock-data";
import sparkle from "../../assets/ask-stellar-sparkle.svg";

import "./styles.scss";

// Prototype-only. There is no chat component in SDS, and the panel's shell
// (24px radius, drop shadow, bubble styling) has no SDS equivalent either.
// The interactive pieces inside it are all SDS: the two action buttons map to
// Button secondary/tertiary at size md with no overrides.
//
// TODO: no API. Replies are hand-written and keyed by suggestion text, so the
// three suggestions answer on topic but anything typed freehand falls back to
// the deploy reply. Multi-turn is visual only.

export const AskStellarPanel = ({
  messages,
  onSend,
  onClose,
}: {
  /** User messages, oldest first. Each one is answered by the canned reply. */
  messages: string[];
  onSend: (text: string) => void;
  onClose: () => void;
}) => {
  const [draft, setDraft] = useState("");
  const panelEl = useRef<HTMLDivElement>(null);
  const scrollEl = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Move focus into the panel when it opens.
  useEffect(() => {
    panelEl.current?.focus();
  }, []);

  // Close on Escape from anywhere in the panel.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Keep the newest exchange in view.
  useEffect(() => {
    const el = scrollEl.current;

    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const text = draft.trim();

    if (text) {
      onSend(text);
      setDraft("");
    }
  };

  return (
    <div
      className="AskStellarPanel"
      role="dialog"
      aria-label="Ask Stellar"
      tabIndex={-1}
      ref={panelEl}
    >
      <div className="AskStellarPanel__header">
        <div className="AskStellarPanel__title">
          <Image
            src={sparkle}
            alt=""
            width={20}
            height={20}
            aria-hidden="true"
          />
          <span className="AskStellarPanel__titleText">Ask Stellar</span>
        </div>

        <button
          type="button"
          className="AskStellarPanel__iconButton"
          onClick={onClose}
          aria-label="Close Ask Stellar"
        >
          <Icon.X />
        </button>
      </div>

      <div className="AskStellarPanel__messages" ref={scrollEl}>
        {messages.map((message, idx) => {
          // Each answer carries its own actions, so they follow every reply
          // rather than only the last one.
          const reply = getMockAskStellarReply(message);

          return (
            <div className="AskStellarPanel__exchange" key={`${message}-${idx}`}>
              <div className="AskStellarPanel__bubble" data-from="user">
                <Text as="div" size="sm">
                  {message}
                </Text>
              </div>

              <div className="AskStellarPanel__bubble" data-from="assistant">
                <Text as="div" size="sm">
                  {reply.body}
                </Text>
              </div>

              <div className="AskStellarPanel__actions">
                {reply.actions.map((action) => (
                  <Button
                    key={action.id}
                    size="md"
                    variant={action.variant}
                    icon={<Icon.ArrowUpRight />}
                    iconPosition="right"
                    onClick={() => {
                      if (action.url) {
                        openUrl(action.url);
                      } else if (action.route) {
                        router.push(action.route);
                      }
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <form className="AskStellarPanel__composer" onSubmit={handleSubmit}>
        <input
          type="text"
          className="AskStellarPanel__composerInput"
          placeholder="Ask Stellar"
          aria-label="Ask a follow-up question"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />

        <button
          type="submit"
          className="AskStellarPanel__iconButton"
          aria-label="Send"
          disabled={!draft.trim()}
        >
          <Icon.Send03 />
        </button>
      </form>
    </div>
  );
};
