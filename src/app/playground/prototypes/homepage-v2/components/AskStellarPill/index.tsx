"use client";

import Image from "next/image";

import sparkle from "../../assets/ask-stellar-sparkle-sm.svg";

import "./styles.scss";

// Positioning: fixed to the viewport at 24px bottom/right. The 24px comes from
// Figma (1440 - (1299 + 117) = 24px right inset); the detached node's y is just
// where it was parked on the canvas, so "fixed to the bottom" is the designer's
// call, not the artboard's.
//
// A plain <button> rather than SDS <Button>: the pill needs a gradient-filled
// label to match the Ask Stellar block, and <Button> paints its own colour on
// the label. Everything else here (height, radius, padding) is deliberately
// off-token to match that block.
//
// On the home page this is the minimised state of the chat panel: it appears
// once a conversation exists and toggles the panel open and closed. The panel
// sits directly above it, as in the Figma frame where both are visible.

export const AskStellarPill = ({
  onClick,
  isPanelOpen,
}: {
  onClick?: () => void;
  /** Drives aria-expanded so the toggle is announced correctly. */
  isPanelOpen?: boolean;
}) => (
  <button
    type="button"
    className="AskStellarPill"
    onClick={onClick}
    aria-expanded={isPanelOpen}
  >
    <Image src={sparkle} alt="" width={16} height={16} aria-hidden="true" />
    <span className="AskStellarPill__label">Ask Stellar</span>
  </button>
);
