"use client";

import { useState } from "react";
import { Icon } from "@stellar/design-system";

import "./CopyPill.scss";

type CopyPillVariant = "pill" | "path";

interface CopyPillProps {
  text: string;
  variant?: CopyPillVariant;
}

export const CopyPill = ({ text, variant = "pill" }: CopyPillProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      type="button"
      className={`CopyPill CopyPill--${variant}`}
      data-copied={isCopied}
      onClick={handleCopy}
    >
      <span className="CopyPill__text">{text}</span>
      <Icon.Copy01 />
    </button>
  );
};
