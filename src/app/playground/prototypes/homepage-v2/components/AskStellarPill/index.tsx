"use client";

import { Button, Logo } from "@stellar/design-system";

import "./styles.scss";

// Positioning: fixed to the viewport at 24px bottom/right. The 24px comes from
// Figma (1440 - (1299 + 117) = 24px right inset); the detached node's y is just
// where it was parked on the canvas, so "fixed to the bottom" is the designer's
// call, not the artboard's.
//
// The wrapper exists only to carry that placement. SDS <Button> spreads its
// props over its own className (__assign({className: "Button ..."}, props)), so
// passing a class here would erase Button--tertiary/lg/rounded — hence a
// positioned parent rather than a class on the button.
//
// SDS <Button> carries everything else. variant="tertiary" is gray-01 bg /
// gray-06 border / gray-12 text — the Figma spec token for token — size="lg"
// is 14px semibold at 8/12 padding, and isRounded sets radius to height/2,
// which on a 40px box is the same pill a literal 100px would clamp to.
//
// The mark is Logo.StellarShort, not a committed export. SDS colours icons by
// stroke (.Button__icon svg), but the logo is a filled path reading
// --sds-logo-fill, so the fill is set in the SCSS rather than by the variant.
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
  <div className="AskStellarPill">
    <Button
      type="button"
      variant="tertiary"
      size="lg"
      isRounded
      icon={<Logo.StellarShort />}
      iconPosition="left"
      onClick={onClick}
      aria-expanded={isPanelOpen}
    >
      Ask Stellar
    </Button>
  </div>
);
