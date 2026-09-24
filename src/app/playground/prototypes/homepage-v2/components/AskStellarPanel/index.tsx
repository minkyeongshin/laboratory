"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Floater,
  Icon,
  Link,
  Logo,
  Text,
} from "@stellar/design-system";

import { openUrl } from "@/helpers/openUrl";

import {
  getMockAskStellarReply,
  mockAskStellarSuggestions,
  type AskStellarInlineLink,
  type AskStellarSource,
} from "../../mock-data";

import "./styles.scss";

// Prototype-only. There is no chat component in SDS, and the panel's shell
// (24px radius, drop shadow) has no SDS equivalent either. Every control inside
// it is an SDS <Button>.
//
// Button styling goes through data attributes rather than className: SDS
// <Button> spreads its props over its own className, so passing a class would
// erase Button--tertiary/sm. Other props survive, so `data-panel-role` is the
// hook, and the overrides in styles.scss are written against SDS's own
// --Button-* custom properties.
//
// TODO: no API. Replies are hand-written and keyed by suggestion text, so the
// three suggestions answer on topic but anything typed freehand falls back to
// the deploy reply. The typing delay below is theatre, not a real request.

/** Fake think-time before a reply appears, in ms. */
const TYPING_MIN_MS = 600;
const TYPING_MAX_MS = 900;

/**
 * Empty-state icons, keyed by suggestion text — the same keying the reply map
 * uses. Icons are presentation, so they live here rather than in mock-data.
 */
const SUGGESTION_ICONS: Record<string, React.ReactNode> = {
  "How do I create a transaction?": <Icon.BezierCurve03 />,
  "How do I deploy a smart contract?": <Icon.Terminal />,
  "What can I build with Stellar?": <Icon.Tool01 />,
};

/** How close to the end counts as "at the bottom", in px. */
const AT_BOTTOM_SLOP = 8;

/**
 * Splits a paragraph on its link labels so the copy stays one readable string
 * in mock-data rather than a pre-segmented array. Each label is matched once,
 * in order, and a label that isn't found is skipped rather than throwing.
 */
const renderParagraph = (
  text: string,
  links: AskStellarInlineLink[] | undefined,
  onNavigate: (link: AskStellarInlineLink) => void,
): React.ReactNode => {
  if (!links?.length) {
    return text;
  }

  // Narrower than ReactNode on purpose: ReactNode includes Iterable<ReactNode>,
  // which makes flatMap's return type ambiguous and fails to typecheck. These
  // segments are only ever the plain text between links, or a link.
  let nodes: (string | React.ReactElement)[] = [text];

  links.forEach((link, linkIdx) => {
    let isPlaced = false;

    nodes = nodes.flatMap((node, nodeIdx) => {
      if (isPlaced || typeof node !== "string") {
        return [node];
      }

      const at = node.indexOf(link.label);

      if (at === -1) {
        return [node];
      }

      isPlaced = true;

      return [
        node.slice(0, at),
        <Link
          key={`${linkIdx}-${nodeIdx}`}
          variant="primary"
          isUnderline
          href={link.url ?? link.route}
          addlClassName="AskStellarPanel__link"
          onClick={() => onNavigate(link)}
        >
          {link.label}
        </Link>,
        node.slice(at + link.label.length),
      ];
    });
  });

  return nodes;
};

/**
 * The cited-sources pill that closes a paragraph. Reads as part of the sentence
 * rather than as a separate row, so it is inline content inside the paragraph.
 *
 * Renders as an anchor when it points at a single source and as a button when
 * it opens a menu. Same class either way, so the two are visually identical —
 * the difference is only what the pill does.
 */
const SourceBadge = ({
  sources,
  isOpen,
  onClick,
  href,
}: {
  sources: AskStellarSource[];
  isOpen?: boolean;
  /**
   * Supplied by <Floater>, which clones this element to attach its own toggle.
   * It has to be forwarded to the button — cloneElement sets the prop on this
   * component, and a component that ignores it swallows the toggle silently.
   */
  onClick?: () => void;
  /** Set only for a lone source, which the badge links to directly. */
  href?: string;
}) => {
  const content = (
    <>
      {/* Stand-in for a per-source favicon: real ones would be remote images,
          which the CSP in src/middleware.ts does not allow from here. */}
      <span className="AskStellarPanel__sourceIcon" aria-hidden="true">
        <Icon.Globe01 />
      </span>

      <span className="AskStellarPanel__sourceLabel">
        {sources[0].title}
        {sources.length > 1 ? ` +${sources.length - 1}` : ""}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        className="AskStellarPanel__sourceBadge"
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`Source: ${sources[0].title}`}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className="AskStellarPanel__sourceBadge"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      aria-label={`Sources: ${sources.map((s) => s.title).join(", ")}`}
    >
      {content}
    </button>
  );
};

/**
 * A paragraph's citation: the badge, and the menu it opens when there is more
 * than one source. A lone source has nothing to choose between, so the badge
 * links straight to it and no menu is built at all.
 *
 * For the menu case, SDS <Floater> does the positioning and the click-outside,
 * and drives the badge by cloning it with its own onClick — so the badge
 * carries no handler of its own. It does not handle Escape, and its controlled
 * `isVisible` mode disables click-outside entirely, so Escape is handled by the
 * panel remounting this through `epoch` instead. `callback` reports the open
 * state back for aria-expanded.
 */
const SourceCitation = ({
  sources,
  isOpen,
  onOpenChange,
}: {
  sources: AskStellarSource[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) =>
  sources.length === 1 ? (
    <SourceBadge sources={sources} href={sources[0].url} />
  ) : (
    <Floater
      // Opens upward. <Floater> takes no boundary, so floating-ui flips against
      // the viewport rather than the panel's scroll container, and a badge near
      // the bottom had its menu clipped by the panel edge. A badge is always at
      // the end of a paragraph, so above is the side with room.
      placement="top"
      offset={8}
      // Smaller than the 24px default: the box it has to stay inside is a 414px
      // panel, not a page.
      padding={8}
      // Picking a source closes the menu behind it.
      hasActiveInsideClick
      isContrast={false}
      callback={onOpenChange}
      triggerEl={<SourceBadge sources={sources} isOpen={isOpen} />}
    >
      <div className="AskStellarPanel__sourceMenu" role="menu">
        {sources.map((source, idx) => (
          <Fragment key={source.id}>
            {idx > 0 ? (
              <span
                className="AskStellarPanel__sourceDivider"
                aria-hidden="true"
              />
            ) : null}

            <a
              className="AskStellarPanel__sourceItem"
              href={source.url}
              target="_blank"
              rel="noreferrer noopener"
              role="menuitem"
            >
              <span className="AskStellarPanel__sourceItemTitle">
                <span
                  className="AskStellarPanel__sourceIcon"
                  aria-hidden="true"
                >
                  <Icon.Globe01 />
                </span>
                {source.title}
                <span
                  className="AskStellarPanel__sourceItemArrow"
                  aria-hidden="true"
                >
                  <Icon.ArrowUpRight />
                </span>
              </span>

              <span className="AskStellarPanel__sourceItemDesc">
                {source.description}
              </span>
            </a>
          </Fragment>
        ))}
      </div>
    </Floater>
  );

export const AskStellarPanel = ({
  messages,
  answeredCount,
  onSend,
  onAnswered,
  onClose,
}: {
  /** User messages, oldest first. Each is answered by the canned reply. */
  messages: string[];
  /** Messages past this index are still "thinking". */
  answeredCount: number;
  onSend: (text: string) => void;
  onAnswered: () => void;
  onClose: () => void;
}) => {
  const [draft, setDraft] = useState("");
  // Visual only — the mic records nothing. Tapping it swaps the mic for a stop
  // button so the recording state can be reviewed; tapping stop swaps it back.
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  // Hides the scroll-to-bottom button while the newest reply is already in view.
  const [isAtBottom, setIsAtBottom] = useState(true);
  // Which source badge has its menu open, as "<exchange>-<paragraph>".
  const [openSourceKey, setOpenSourceKey] = useState<string | null>(null);
  // Bumped to force every <Floater> to remount closed — see closeSourceMenu.
  const [floaterEpoch, setFloaterEpoch] = useState(0);
  /**
   * Where the thread sat when the open menu was anchored, or null while that
   * is still settling. Scrolling past this point dismisses the menu.
   */
  const menuAnchorScrollTop = useRef<number | null>(null);
  const panelEl = useRef<HTMLDivElement>(null);
  const scrollEl = useRef<HTMLDivElement>(null);
  // The newest question bubble, which a landed reply scrolls to the top.
  const lastBubbleEl = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const navigate = useCallback(
    (link: AskStellarInlineLink) => {
      if (link.url) {
        openUrl(link.url);
      } else if (link.route) {
        router.push(link.route);
      }
    },
    [router],
  );

  /**
   * <Floater> exposes no imperative close, and its controlled mode turns off
   * click-outside, so Escape closes the menu by remounting the Floaters with a
   * new key. Only one can be open at a time, so remounting all of them is a
   * no-op for the rest.
   */
  const closeSourceMenu = useCallback(() => {
    setFloaterEpoch((epoch) => epoch + 1);
    setOpenSourceKey(null);
    menuAnchorScrollTop.current = null;
  }, []);

  const handleSourceOpenChange = useCallback((key: string, isOpen: boolean) => {
    // Opening a second badge closes the first, and the two callbacks can land
    // in either order — so a stale `false` must not clear the new key.
    setOpenSourceKey((prev) => {
      if (isOpen) {
        return key;
      }

      return prev === key ? null : prev;
    });

    if (!isOpen) {
      menuAnchorScrollTop.current = null;
      return;
    }

    // Opening focuses the badge, and focusing one that sits partly below the
    // fold makes the browser scroll it into view. That scroll is a consequence
    // of opening, not the reader moving the thread, so the anchor is taken on
    // the next frame, once it has landed. Until then it stays null and
    // scrolling dismisses nothing — otherwise the menu closed itself the
    // instant it opened.
    menuAnchorScrollTop.current = null;
    requestAnimationFrame(() => {
      menuAnchorScrollTop.current = scrollEl.current?.scrollTop ?? 0;
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = scrollEl.current;

    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollEl.current;

    if (!el) {
      return;
    }

    setIsAtBottom(
      el.scrollHeight - el.scrollTop - el.clientHeight <= AT_BOTTOM_SLOP,
    );

    // The menu is anchored to a badge inside this scroll area, so it travels
    // with it. Once the thread moves it has stopped reading as attached to the
    // sentence it came from, and a menu that outlives its anchor is worse than
    // no menu — so scrolling dismisses it, the same way clicking away does.
    // Measured against the anchor rather than "any scroll", so the browser's
    // own scroll-into-view on opening does not count as the reader moving.
    const anchor = menuAnchorScrollTop.current;

    if (openSourceKey && anchor !== null && el.scrollTop !== anchor) {
      closeSourceMenu();
    }
  }, [openSourceKey, closeSourceMenu]);

  const isThinking = messages.length > answeredCount;
  const hasThread = messages.length > 0;
  const hasDraft = Boolean(draft.trim());

  // Move focus into the panel when it opens.
  useEffect(() => {
    panelEl.current?.focus();
  }, []);

  // Escape closes the open source menu first, and only then the panel — so it
  // dismisses one layer at a time rather than everything at once.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      if (openSourceKey) {
        closeSourceMenu();
      } else {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, openSourceKey, closeSourceMenu]);

  // Fake latency, so a reply doesn't appear in the same frame as the question.
  useEffect(() => {
    if (!isThinking) {
      return;
    }

    const delay =
      TYPING_MIN_MS + Math.random() * (TYPING_MAX_MS - TYPING_MIN_MS);
    const timer = setTimeout(onAnswered, delay);

    return () => clearTimeout(timer);
  }, [isThinking, onAnswered]);

  // A question was just sent: drop to the bottom, so the question and the
  // "Thinking..." indicator under it are both in view.
  useEffect(() => {
    const el = scrollEl.current;

    if (el) {
      el.scrollTop = el.scrollHeight;
      setIsAtBottom(true);
    }
  }, [messages.length]);

  // A reply landed: park the question at the top of the view instead, so the
  // answer is read from its first line down. Pinning to the bottom would drop
  // the reader at the end of an answer they have not read yet.
  useEffect(() => {
    const el = scrollEl.current;

    if (!el || answeredCount === 0) {
      return;
    }

    const bubble = lastBubbleEl.current;
    // The first exchange goes to the very top, which keeps the "Today" label
    // above it in view; later ones put the bubble itself at the top.
    const isFirstExchange = messages.length === 1;

    if (!isFirstExchange && bubble) {
      // Read the padding rather than repeating the SCSS value here, so the two
      // cannot drift apart.
      const padTop = parseFloat(getComputedStyle(el).paddingTop) || 0;
      const offset =
        bubble.getBoundingClientRect().top - el.getBoundingClientRect().top;

      el.scrollTop = Math.max(0, el.scrollTop + offset - padTop);
    } else {
      el.scrollTop = 0;
    }

    // Set directly: if the scroll position did not actually change, no scroll
    // event fires and handleScroll would never run.
    setIsAtBottom(
      el.scrollHeight - el.scrollTop - el.clientHeight <= AT_BOTTOM_SLOP,
    );
  }, [answeredCount, messages.length]);

  const submit = (text: string) => {
    const trimmed = text.trim();

    if (trimmed) {
      onSend(trimmed);
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
          {/* Decorative: the adjacent text already says "Ask Stellar".
              Sized and coloured from styles.scss — the SDS logo renders at
              1em and fills from --sds-logo-fill. */}
          <Logo.StellarShort aria-hidden="true" />
          <span className="AskStellarPanel__titleText">Ask Stellar</span>
        </div>

        <Button
          variant="tertiary"
          size="sm"
          icon={<Icon.X />}
          onClick={onClose}
          aria-label="Close Ask Stellar"
          data-panel-role="close"
        />
      </div>

      <div
        className="AskStellarPanel__messages"
        ref={scrollEl}
        onScroll={handleScroll}
      >
        {hasThread ? (
          <div className="AskStellarPanel__thread">
            {/* Static: every prototype conversation starts in this session. */}
            <div className="AskStellarPanel__day">Today</div>

            {messages.map((message, idx) => {
              const isAnswered = idx < answeredCount;
              const reply = getMockAskStellarReply(message);

              return (
                <div
                  className="AskStellarPanel__exchange"
                  key={`${message}-${idx}`}
                >
                  <div
                    className="AskStellarPanel__bubble"
                    data-from="user"
                    ref={idx === messages.length - 1 ? lastBubbleEl : undefined}
                  >
                    <Text as="div" size="sm">
                      {message}
                    </Text>
                  </div>

                  {isAnswered ? (
                    // No bubble: the assistant is the panel's own voice, so it
                    // reads as body copy rather than as a message from someone
                    // else.
                    <div className="AskStellarPanel__reply">
                      {reply.paragraphs.map((paragraph, pIdx) => {
                        const sourceKey = `${idx}-${pIdx}`;

                        return (
                          <div
                            className="AskStellarPanel__paragraph"
                            key={pIdx}
                          >
                            {renderParagraph(
                              paragraph.text,
                              paragraph.links,
                              navigate,
                            )}

                            {paragraph.sources?.length ? (
                              <>
                                {/* Ordinary space, so the badge sits after the
                                    last word and wraps with it if the line is
                                    full. */}{" "}
                                <SourceCitation
                                  key={`${sourceKey}-${floaterEpoch}`}
                                  sources={paragraph.sources}
                                  isOpen={openSourceKey === sourceKey}
                                  onOpenChange={(next) =>
                                    handleSourceOpenChange(sourceKey, next)
                                  }
                                />
                              </>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      className="AskStellarPanel__thinking"
                      role="status"
                      aria-label="Ask Stellar is replying"
                    >
                      Thinking...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="AskStellarPanel__empty">
            <Text
              as="h2"
              size="md"
              weight="medium"
              addlClassName="AskStellarPanel__emptyTitle"
            >
              What can I help with?
            </Text>

            <ul className="AskStellarPanel__suggestions">
              {mockAskStellarSuggestions.map((suggestion) => (
                <li key={suggestion} className="AskStellarPanel__suggestion">
                  <Button
                    variant="tertiary"
                    size="md"
                    isFullWidth
                    icon={SUGGESTION_ICONS[suggestion]}
                    iconPosition="left"
                    onClick={() => submit(suggestion)}
                    data-panel-role="suggestion"
                  >
                    {suggestion}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="AskStellarPanel__composer">
        {/* Lives in the composer wrapper so it tracks the composer's top edge
            rather than the scroll container's, and overflows upward into the
            fade. Only shown once there is something below the fold. */}
        {hasThread && !isAtBottom ? (
          <Button
            variant="tertiary"
            size="sm"
            isRounded
            icon={<Icon.ArrowDown />}
            onClick={scrollToBottom}
            aria-label="Scroll to latest"
            data-panel-role="scroll-bottom"
          />
        ) : null}

        <form
          className="AskStellarPanel__composerBox"
          onSubmit={(event) => {
            event.preventDefault();
            submit(draft);
          }}
        >
          <textarea
            className="AskStellarPanel__composerInput"
            placeholder={hasThread ? "Ask a follow-up…" : "Ask Stellar AI"}
            aria-label={
              hasThread ? "Ask a follow-up question" : "Ask Stellar AI"
            }
            value={draft}
            rows={1}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends, shift+Enter makes a new line.
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(draft);
              }
            }}
          />

          <div className="AskStellarPanel__composerActions">
            {isVoiceActive ? (
              <Button
                variant="error"
                size="sm"
                icon={<Icon.Square />}
                onClick={() => setIsVoiceActive(false)}
                aria-label="Stop recording"
                data-panel-role="voice-stop"
              />
            ) : (
              <Button
                variant="tertiary"
                size="sm"
                icon={<Icon.Microphone02 />}
                onClick={() => setIsVoiceActive(true)}
                aria-label="Record a question"
                data-panel-role="mic"
              />
            )}

            {isThinking ? (
              // Mocked: there is nothing to cancel, so stopping just ends the
              // fake think-time and reveals the reply that was coming anyway.
              <Button
                variant="primary"
                size="sm"
                icon={<Icon.Square />}
                onClick={onAnswered}
                aria-label="Stop generating"
                data-panel-role="stop"
              />
            ) : (
              <Button
                type="submit"
                // Fills in as soon as there is something to send.
                variant={hasDraft ? "primary" : "tertiary"}
                size="sm"
                icon={<Icon.Send03 />}
                aria-label="Send"
                data-panel-role="send"
              />
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
