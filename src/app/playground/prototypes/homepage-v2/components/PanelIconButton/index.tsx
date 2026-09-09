import "./styles.scss";

// Created instead of using SDS <IconButton> because that component is a bare
// glyph — `border: none; background-color: transparent; padding: 0`, sized only
// by --IconButton-size. This needs a 28px bordered box with a background and a
// hover state, so adopting it would mean overriding border, background,
// padding, width and height, which is the whole component.
//
// Named PanelIconButton rather than IconButton so it can't be confused with the
// SDS export at a glance.

export const PanelIconButton = ({
  icon,
  label,
  onClick,
  type = "button",
  disabled,
}: {
  icon: React.ReactNode;
  /** Accessible name; also the native tooltip. */
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) => (
  <button
    type={type}
    className="PanelIconButton"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
  >
    {icon}
  </button>
);
