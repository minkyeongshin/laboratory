"use client";

import "./styles.scss";

// Positioning: fixed to the viewport at 24px bottom/right. The 24px comes from
// Figma (1440 - (1299 + 117) = 24px right inset); the detached node's y is just
// where it was parked on the canvas, so "fixed to the bottom" is the designer's
// call, not the artboard's.
//
// Local rather than SDS <Button> because the label and icon are lilac-11 on a
// white pill with a gray-06 edge — a combination no SDS variant has. It mirrors
// the Ask Stellar field: neutral chrome, colour carried only by the sparkle and
// the label.
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
    {/* Masked rather than an <img>: the source SVG carries its own gradient
        fill, so it can't be recoloured to lilac-11 as an image. */}
    <span className="AskStellarPill__sparkle" aria-hidden="true" />
    <span className="AskStellarPill__label">Ask Stellar</span>
  </button>
);
