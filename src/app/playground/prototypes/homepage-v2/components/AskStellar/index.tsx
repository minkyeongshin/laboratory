"use client";

import { useState } from "react";
import { Button, Icon, Text } from "@stellar/design-system";

import { Box } from "@/components/layout/Box";

import { mockAskStellarSuggestions } from "../../mock-data";

import "./styles.scss";

// A compose box rather than an input: two lines of room, with the Ask pill
// parked inside at the bottom-right. There is no label row — the placeholder
// carries the feature name.
//
// SDS <Input> is not used because none of its chrome survives: it renders a 1px
// border at a fixed radius with its own label placement, and this needs a
// textarea and an inner action. Overriding all of that would leave nothing of
// the component but its ref handling.
//
// The "Start" button is SDS: variant="secondary" is bg gray-12 with base-00
// text, and isRounded sets radius to height/2.

export const AskStellar = ({
  onSubmit,
}: {
  onSubmit: (query: string) => void;
}) => {
  const [value, setValue] = useState("");
  const hasText = Boolean(value.trim());

  const submit = () => {
    if (hasText) {
      onSubmit(value.trim());
      setValue("");
    }
  };

  return (
    <Box gap="custom" customValue="12px" addlClassName="AskStellar">
      <form
        className="AskStellar__field"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="AskStellar__composeRow">
          <textarea
            className="AskStellar__input"
            placeholder="What are you building?"
            aria-label="What are you building?"
            value={value}
            rows={2}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends, shift+Enter makes a new line.
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />
        </div>

        <div className="AskStellar__fieldFooter">
          {/* Always visible, disabled until there's something to ask. */}
          <Button
            type="submit"
            size="md"
            variant="secondary"
            isRounded
            icon={<Icon.ArrowRight />}
            iconPosition="right"
            disabled={!hasText}
          >
            Start
          </Button>
        </div>
      </form>

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
