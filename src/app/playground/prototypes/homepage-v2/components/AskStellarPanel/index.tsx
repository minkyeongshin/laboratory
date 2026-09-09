"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, Icon, Text } from "@stellar/design-system";

import { openUrl } from "@/helpers/openUrl";

import { PanelIconButton } from "../PanelIconButton";
import { getMockAskStellarReply } from "../../mock-data";
import sparkle from "../../assets/ask-stellar-sparkle.svg";

import "./styles.scss";

// Prototype-only. There is no chat component in SDS, and the panel's shell
// (24px radius, drop shadow) has no SDS equivalent either. The buttons inside
// it are all SDS.
//
// TODO: no API. Replies are hand-written and keyed by suggestion text, so the
// three suggestions answer on topic but anything typed freehand falls back to
// the deploy reply. The typing delay below is theatre, not a real request.

/** Fake think-time before a reply appears, in ms. */
const TYPING_MIN_MS = 600;
const TYPING_MAX_MS = 900;

export const AskStellarPanel = ({
  messages,
  answeredCount,
  onSend,
  onAnswered,
  onClose,
}: {
  /** User messages, oldest first. Each is answered by the canned reply. */
  messages: string[];
  /** Messages past this index are still "typing". */
  answeredCount: number;
  onSend: (text: string) => void;
  onAnswered: () => void;
  onClose: () => void;
}) => {
  const [draft, setDraft] = useState("");
  const panelEl = useRef<HTMLDivElement>(null);
  const scrollEl = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isTyping = messages.length > answeredCount;

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

  // Fake latency, so a reply doesn't appear in the same frame as the question.
  useEffect(() => {
    if (!isTyping) {
      return;
    }

    const delay =
      TYPING_MIN_MS + Math.random() * (TYPING_MAX_MS - TYPING_MIN_MS);
    const timer = setTimeout(onAnswered, delay);

    return () => clearTimeout(timer);
  }, [isTyping, onAnswered]);

  // Keep the newest exchange — question, indicator, then reply — in view.
  useEffect(() => {
    const el = scrollEl.current;

    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, answeredCount]);

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

        <PanelIconButton
          icon={<Icon.X />}
          label="Close Ask Stellar"
          onClick={onClose}
        />
      </div>

      <div className="AskStellarPanel__messages" ref={scrollEl}>
        {messages.map((message, idx) => {
          const isAnswered = idx < answeredCount;
          const reply = getMockAskStellarReply(message);

          return (
            <div className="AskStellarPanel__exchange" key={`${message}-${idx}`}>
              <div className="AskStellarPanel__bubble" data-from="user">
                <Text as="div" size="sm">
                  {message}
                </Text>
              </div>

              {isAnswered ? (
                <>
                  {/* No bubble: the assistant is the panel's own voice, so it
                      reads as body copy rather than as a message from someone
                      else. */}
                  <div className="AskStellarPanel__reply">
                    <Text as="div" size="sm">
                      {reply.body}
                    </Text>
                  </div>

                  <div className="AskStellarPanel__actions">
                    {reply.actions.map((action) => (
                      <Button
                        key={action.id}
                        size="md"
                        // Always tertiary — no primary action inside the panel.
                        variant="tertiary"
                        // Convention: -> internal route, external link.
                        icon={
                          action.url ? (
                            <Icon.LinkExternal01 />
                          ) : (
                            <Icon.ArrowRight />
                          )
                        }
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
                </>
              ) : (
                <div
                  className="AskStellarPanel__typing"
                  role="status"
                  aria-label="Ask Stellar is replying"
                >
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form className="AskStellarPanel__composer" onSubmit={handleSubmit}>
        <input
          type="text"
          className="AskStellarPanel__composerInput"
          placeholder="Ask a follow-up…"
          aria-label="Ask a follow-up question"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />

        <PanelIconButton
          type="submit"
          icon={<Icon.Send03 />}
          label="Send"
          disabled={!draft.trim()}
        />
      </form>
    </div>
  );
};
