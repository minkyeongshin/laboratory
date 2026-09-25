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
  type AskStellarParagraph,
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

/** Fake think-time before a reply starts arriving, in ms. */
const THINKING_MS = 800;

// The reply is then revealed a word at a time. The jitter keeps the rhythm off
// a metronome, and the longer pause lands where a reader would draw breath —
// after sentence-ending punctuation and between paragraphs. All four are here
// to be tuned by feel.
const STREAM_WORD_MS = 45;
/** Random ± applied to STREAM_WORD_MS. */
const STREAM_JITTER_MS = 20;
/** Total delay after a break, in place of the usual word delay. */
const STREAM_PAUSE_MS = 150;
/** Punctuation that earns the longer pause. */
const STREAM_PAUSE_AFTER = /[.?:]$/;

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
 * Resolves a length read back from a custom property.
 *
 * getComputedStyle returns custom properties as authored rather than resolved
 * — "2.5rem", not "40px" — so a bare parseFloat silently reads 2.5 pixels and
 * the value quietly disagrees with what CSS is doing with the same token.
 */
const cssLengthToPx = (value: string) => {
  const n = parseFloat(value);

  if (!Number.isFinite(n)) {
    return 0;
  }

  return value.trim().endsWith("rem")
    ? n * parseFloat(getComputedStyle(document.documentElement).fontSize)
    : n;
};

/**
 * The reply's words in reveal order, each flagged if it closes a paragraph —
 * which is where the stream pauses, along with sentence-ending punctuation.
 */
const flattenReplyWords = (paragraphs: AskStellarParagraph[]) =>
  paragraphs.flatMap((paragraph, pIdx) => {
    const words = paragraph.text.split(" ");

    return words.map((word, i) => ({
      word,
      isParagraphEnd: i === words.length - 1 && pIdx < paragraphs.length - 1,
    }));
  });

/**
 * How much of each paragraph to show for a given reveal count, where the count
 * runs across the whole reply rather than per paragraph — so paragraphs arrive
 * in order off a single counter.
 *
 * `revealed: null` means "not streaming": everything is complete. A paragraph
 * that has not started yet reports `hasStarted: false` so it can be skipped
 * entirely rather than rendered as an empty row.
 */
const sliceReply = (
  paragraphs: AskStellarParagraph[],
  revealed: number | null,
) => {
  let before = 0;

  return paragraphs.map((paragraph) => {
    if (revealed === null) {
      return {
        paragraph,
        text: paragraph.text,
        hasStarted: true,
        isComplete: true,
      };
    }

    const words = paragraph.text.split(" ");
    const shown = Math.max(0, Math.min(words.length, revealed - before));

    before += words.length;

    return {
      paragraph,
      text: words.slice(0, shown).join(" "),
      hasStarted: shown > 0,
      isComplete: shown === words.length,
    };
  });
};

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
  /**
   * The reply currently being revealed, or null when nothing is streaming.
   *
   * Deliberately local rather than in the store: it is presentation, and a
   * session restored from sessionStorage must render its reply whole rather
   * than replay an animation the reader already watched.
   */
  const [stream, setStream] = useState<{
    idx: number;
    revealed: number;
    total: number;
  } | null>(null);
  /** Set when Stop is pressed mid-think, so the reply arrives whole. */
  const skipNextStream = useRef(false);
  /**
   * The answeredCount the stream decision has been made for; null until the
   * first pass. State rather than a ref because clearing it has to re-render:
   * when the decision is "do not stream", nothing else would.
   */
  const [decidedFor, setDecidedFor] = useState<number | null>(null);
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
  /**
   * The last real content in the thread — the newest reply, or the
   * "Thinking..." indicator standing in for it. The scroll-to-bottom button is
   * measured against this rather than scrollHeight, because the newest exchange
   * reserves a screenful of empty space that is not something to scroll to.
   */
  const lastContentEl = useRef<HTMLDivElement>(null);
  /** The composer overlays the foot of the scroll area; measured, not assumed. */
  const composerEl = useRef<HTMLDivElement>(null);
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

  /**
   * Where the thread would have to sit for the last of the answer to clear the
   * composer. Not scrollHeight: the newest exchange reserves a screenful of
   * blank space beneath itself, and scrolling into that is not "the bottom".
   */
  const contentEnd = useCallback(() => {
    const el = scrollEl.current;
    const content = lastContentEl.current;

    if (!el || !content) {
      return 0;
    }

    // The content's bottom edge in scroll coordinates.
    const bottom =
      content.getBoundingClientRect().bottom -
      el.getBoundingClientRect().top +
      el.scrollTop;

    return Math.max(
      0,
      bottom - el.clientHeight + (composerEl.current?.offsetHeight ?? 0),
    );
  }, []);

  /**
   * Whether the end of the answer is readable from a given scroll position.
   * Takes the position as an argument because a smooth park is still in flight
   * when this has to be decided.
   */
  const isEndInView = useCallback(
    (scrollTop: number) => {
      if (!lastContentEl.current) {
        return true;
      }

      return scrollTop >= contentEnd() - AT_BOTTOM_SLOP;
    },
    [contentEnd],
  );

  const scrollToBottom = useCallback(() => {
    const el = scrollEl.current;

    if (el) {
      el.scrollTo({ top: contentEnd(), behavior: "smooth" });
    }
  }, [contentEnd]);

  const handleScroll = useCallback(() => {
    const el = scrollEl.current;

    if (!el) {
      return;
    }

    setIsAtBottom(isEndInView(el.scrollTop));

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
  }, [openSourceKey, closeSourceMenu, isEndInView]);

  const isThinking = messages.length > answeredCount;
  const isStreaming = stream !== null;
  /**
   * answeredCount changes one render before the effect below can decide
   * whether to stream, and in that render `stream` is still null — which would
   * paint the whole reply for a frame before it collapsed back to its first
   * word. A reply the effect has not ruled on yet counts as nothing revealed.
   *
   */
  const isAwaitingStream = decidedFor !== null && decidedFor < answeredCount;
  const hasThread = messages.length > 0;
  const hasDraft = Boolean(draft.trim());

  /**
   * Stop finishes the reply instantly, whichever stage it is at: mid-stream it
   * drops the remaining words in, mid-think it marks the reply so it arrives
   * whole rather than starting a stream the reader just asked to skip.
   */
  const handleStop = useCallback(() => {
    if (stream) {
      setStream(null);
      return;
    }

    skipNextStream.current = true;
    onAnswered();
  }, [stream, onAnswered]);

  // Move focus into the panel when it opens.
  useEffect(() => {
    panelEl.current?.focus();
  }, []);

  /**
   * Publishes the scroll viewport's height to CSS, so the newest exchange can
   * reserve a screen of space under itself (see __exchange:last-child). Without
   * that reservation there is nothing below a fresh question to scroll against,
   * and parking it at the top silently clamps partway.
   *
   * Set as a custom property through the ref rather than a React `style` prop:
   * the playground rules bar inline styles, and a measured value has to reach
   * the stylesheet somehow. Re-measured on resize so it tracks the panel's
   * viewport clamp.
   */
  useEffect(() => {
    const el = scrollEl.current;
    const panel = panelEl.current;

    if (!el || !panel) {
      return;
    }

    const measure = () => {
      const style = getComputedStyle(el);
      const padTop = parseFloat(style.paddingTop) || 0;
      const padBottom = parseFloat(style.paddingBottom) || 0;

      // Both paddings come out, so this is the content height a full-screen
      // exchange has to fill. Leaving the bottom one in left 16px of residual
      // scroll after parking, which was enough to show the scroll-to-bottom
      // button over nothing.
      panel.style.setProperty(
        "--AskStellarPanel-viewport",
        `${el.clientHeight - padTop - padBottom}px`,
      );
      // The scroll area starts directly under the header, so its offset is the
      // header's height — which is what the top fade has to sit below.
      panel.style.setProperty("--AskStellarPanel-header", `${el.offsetTop}px`);
    };

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(el);

    return () => observer.disconnect();
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

    const timer = setTimeout(onAnswered, THINKING_MS);

    return () => clearTimeout(timer);
  }, [isThinking, onAnswered]);

  /**
   * Bring the newest question near the top of the view — not flush against the
   * header, but with a sliver of the previous answer still showing above it, so
   * the thread reads as continuing rather than as starting over. The first
   * exchange goes to the very top instead, which keeps "Today" in view.
   *
   * This always reaches its target: the newest exchange reserves a screen of
   * space beneath itself (see __exchange:last-child).
   */
  const park = useCallback(() => {
    const el = scrollEl.current;
    const panel = panelEl.current;

    if (!el || !panel) {
      return;
    }

    const bubble = lastBubbleEl.current;
    const isFirstExchange = messages.length === 1;
    let target = 0;

    if (!isFirstExchange && bubble) {
      // Both read back rather than repeated here, so the SCSS stays the one
      // place these numbers are written down.
      const padTop = parseFloat(getComputedStyle(el).paddingTop) || 0;
      const peek = cssLengthToPx(
        getComputedStyle(panel).getPropertyValue("--AskStellarPanel-park-peek"),
      );
      const offset =
        bubble.getBoundingClientRect().top - el.getBoundingClientRect().top;

      target = Math.max(0, el.scrollTop + offset - padTop - peek);
    }

    // Glides rather than jumps, so the question visibly travels up the panel
    // and the reader can see where it went.
    el.scrollTo({
      top: target,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });

    // Measured against the target rather than the current position: the scroll
    // is still in flight, and if it turns out to be a no-op no scroll event
    // fires and handleScroll would never run.
    setIsAtBottom(isEndInView(target));
  }, [messages.length, isEndInView]);

  // A question was just sent: park it straight away, so it does not jump when
  // the reply lands. "Thinking..." appears directly under it and the reply then
  // streams into the reserved space below.
  useEffect(() => {
    park();
  }, [messages.length, park]);

  // A reply landed. Park the question at the top of the view — pinning to the
  // bottom would drop the reader at the end of an answer they have not read —
  // and start revealing the text, unless this is a restored session, a Stop
  // press, or the reader has asked for less motion.
  useEffect(() => {
    const previous = decidedFor;

    setDecidedFor(answeredCount);

    if (answeredCount === 0) {
      return;
    }

    park();

    const isRestoredSession = previous === null;
    const wasStopped = skipNextStream.current;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    skipNextStream.current = false;

    if (
      isRestoredSession ||
      wasStopped ||
      prefersReducedMotion ||
      answeredCount <= (previous ?? 0)
    ) {
      return;
    }

    const idx = answeredCount - 1;

    setStream({
      idx,
      revealed: 0,
      total: flattenReplyWords(getMockAskStellarReply(messages[idx]).paragraphs)
        .length,
    });
  }, [answeredCount, decidedFor, messages, park]);

  // Reveal the next word, until the reply is whole. The wait is measured from
  // the word just shown, so the pause lands after the punctuation rather than
  // before it.
  useEffect(() => {
    if (!stream) {
      return;
    }

    if (stream.revealed >= stream.total) {
      setStream(null);
      return;
    }

    const words = flattenReplyWords(
      getMockAskStellarReply(messages[stream.idx]).paragraphs,
    );
    const previous = words[stream.revealed - 1];
    const isBreak =
      previous &&
      (previous.isParagraphEnd || STREAM_PAUSE_AFTER.test(previous.word));
    const delay = isBreak
      ? STREAM_PAUSE_MS
      : STREAM_WORD_MS + (Math.random() * 2 - 1) * STREAM_JITTER_MS;

    const timer = setTimeout(() => {
      setStream((s) => (s ? { ...s, revealed: s.revealed + 1 } : s));
    }, delay);

    return () => clearTimeout(timer);
  }, [stream, messages]);

  // Text arriving under the reader grows the content without firing a scroll
  // event, so the button state has to be recomputed on every reveal. No
  // re-parking: the reserved space means the question was already where it
  // belongs before the first word landed.
  useEffect(() => {
    const el = scrollEl.current;

    if (el) {
      setIsAtBottom(isEndInView(el.scrollTop));
    }
  }, [stream, isEndInView]);

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

      {/* Decorative; the composer's gradient has no element because its
          wrapper carries it, but this end has nothing to hang off. */}
      <div className="AskStellarPanel__topFade" aria-hidden="true" />

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
              const isLast = idx === messages.length - 1;
              const reply = getMockAskStellarReply(message);
              // null — everything complete — unless this exchange is being
              // revealed, or is about to be and has not been ruled on yet.
              const revealed =
                stream?.idx === idx
                  ? stream.revealed
                  : isAwaitingStream && idx === answeredCount - 1
                    ? 0
                    : null;
              const slices = sliceReply(reply.paragraphs, revealed);

              return (
                <div
                  className="AskStellarPanel__exchange"
                  key={`${message}-${idx}`}
                >
                  <div
                    className="AskStellarPanel__bubble"
                    data-from="user"
                    ref={isLast ? lastBubbleEl : undefined}
                  >
                    <Text as="div" size="sm">
                      {message}
                    </Text>
                  </div>

                  {isAnswered ? (
                    // No bubble: the assistant is the panel's own voice, so it
                    // reads as body copy rather than as a message from someone
                    // else.
                    <div
                      className="AskStellarPanel__reply"
                      ref={isLast ? lastContentEl : undefined}
                    >
                      {slices.map((slice, pIdx) => {
                        const { paragraph } = slice;
                        const sourceKey = `${idx}-${pIdx}`;

                        // Not reached yet: skipped entirely rather than left as
                        // an empty row that would jump when its first word
                        // arrives.
                        if (!slice.hasStarted) {
                          return null;
                        }

                        return (
                          <div
                            className="AskStellarPanel__paragraph"
                            key={pIdx}
                          >
                            {/* Links and the source badge belong to a finished
                                paragraph; mid-stream it is plain text. */}
                            {slice.isComplete
                              ? renderParagraph(
                                  paragraph.text,
                                  paragraph.links,
                                  navigate,
                                )
                              : slice.text}

                            {slice.isComplete && paragraph.sources?.length ? (
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
                      ref={isLast ? lastContentEl : undefined}
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

      <div className="AskStellarPanel__composer" ref={composerEl}>
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
              // While an IME is composing — Korean, Japanese, Chinese — Enter
              // commits the candidate syllable and belongs to the IME, not to
              // us. Sending on it fired twice: once with the committed text and
              // once with the syllable still under composition. `isComposing`
              // is the modern signal; keyCode 229 is the older one some
              // browsers still report.
              if (e.nativeEvent.isComposing || e.keyCode === 229) {
                return;
              }

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

            {isThinking || isStreaming ? (
              // Mocked: there is nothing to cancel, so stopping just skips to
              // the finished reply that was coming anyway. Holds the send slot
              // for the whole of thinking and streaming.
              <Button
                variant="primary"
                size="sm"
                icon={<Icon.Square />}
                onClick={handleStop}
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
