"use client";

import { useState } from "react";
import Image from "next/image";
import { Button, Icon, Text } from "@stellar/design-system";

import { Box } from "@/components/layout/Box";

import { mockAskStellarSuggestions } from "../../mock-data";
import sparkle from "../../assets/ask-stellar-sparkle.svg";

import "./styles.scss";

// This is the one block on the page built deliberately off-token, confirmed
// with the designer: the 3px gradient stroke, 24px radius, and gradient-filled
// label are intentional and have no SDS equivalent.
//
// SDS <Input> is not used because none of its chrome survives: it renders a 1px
// border at a fixed radius with its own label placement. Overriding all of that
// would leave nothing of the component but its ref handling.
//
// The "Ask" button is SDS: variant="secondary" is bg gray-12 with base-00 text,
// and isRounded sets radius to height/2, which matches the export's pill.

export const AskStellar = ({
  onSubmit,
}: {
  onSubmit: (query: string) => void;
}) => {
  const [value, setValue] = useState("");
  const hasText = Boolean(value.trim());

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (hasText) {
      onSubmit(value.trim());
      setValue("");
    }
  };

  return (
    <Box gap="custom" customValue="12px" addlClassName="AskStellar">
      <Box gap="custom" customValue="8px">
        <div className="AskStellar__label">
          <Image
            src={sparkle}
            alt=""
            width={20}
            height={20}
            aria-hidden="true"
          />
          <span className="AskStellar__labelText">Ask Stellar</span>
        </div>

        <form className="AskStellar__field" onSubmit={handleSubmit}>
          <input
            type="text"
            className="AskStellar__input"
            placeholder="Ask anything about building on Stellar..."
            aria-label="Ask anything about building on Stellar"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />

          {/* The button only appears once there's something to ask. */}
          {hasText ? (
            <Button
              type="submit"
              size="md"
              variant="secondary"
              isRounded
              icon={<Icon.ArrowRight />}
              iconPosition="right"
            >
              Ask
            </Button>
          ) : null}
        </form>
      </Box>

      <ul className="AskStellar__suggestions">
        {mockAskStellarSuggestions.map((suggestion) => (
          <li key={suggestion} className="AskStellar__suggestion">
            <button
              type="button"
              className="AskStellar__chip"
              onClick={() => onSubmit(suggestion)}
            >
              <Text as="span" size="sm" weight="medium">
                {suggestion}
              </Text>
            </button>
          </li>
        ))}
      </ul>
    </Box>
  );
};
