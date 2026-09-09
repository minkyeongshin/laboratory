"use client";

import "./styles.scss";

// Positioning: fixed to the viewport at 24px bottom/right. The 24px comes from
// Figma (1440 - (1299 + 117) = 24px right inset); the detached node's y is just
// where it was parked on the canvas, so "fixed to the bottom" is the designer's
// call, not the artboard's.
//
// Local rather than SDS <Button> because of the 3px GRADIENT border. SDS drives
// its border from a single --Button-color-border-* custom property, so it can
// only take a solid colour; a gradient stroke needs the padding-box/border-box
// background trick. (An earlier version of this comment blamed the label — that
// was wrong. The label is solid lilac-11; the gradient is on the border.)
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
