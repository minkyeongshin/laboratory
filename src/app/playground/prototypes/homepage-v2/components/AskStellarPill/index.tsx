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
// label to match the Ask Stellar block above it, and <Button> paints its own
// colour on the label. Everything else here (height, radius, padding) is
// deliberately off-token to match that block.
//
// TODO: no behaviour. Does not open or focus anything.

export const AskStellarPill = () => (
  <button type="button" className="AskStellarPill">
    <Image src={sparkle} alt="" width={16} height={16} aria-hidden="true" />
    <span className="AskStellarPill__label">Ask Stellar</span>
  </button>
);
