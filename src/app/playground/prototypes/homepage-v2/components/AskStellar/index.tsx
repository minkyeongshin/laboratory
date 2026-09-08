"use client";

import Image from "next/image";
import { Text } from "@stellar/design-system";

import { Box } from "@/components/layout/Box";

import { mockAskStellarSuggestions } from "../../mock-data";
import sparkle from "../../assets/ask-stellar-sparkle.svg";

import "./styles.scss";

// This is the one block in Home v2 built deliberately off-token, confirmed with
// the designer: the 3px #544a89 border, 24px radius, and gradient-filled label
// are intentional and have no SDS equivalent.
//
// SDS <Input> is not used because none of its chrome survives: it renders a 1px
// border at a fixed radius with its own label placement. Overriding all of that
// would leave nothing of the component but its ref handling.
//
// TODO: no behaviour. The field does not submit, suggestions do not route, and
// no results surface. It is a visual target for the interaction, not the
// interaction.

export const AskStellar = () => (
  <Box gap="custom" customValue="16px" addlClassName="AskStellar">
    <Box gap="custom" customValue="8px">
      <div className="AskStellar__label">
        <Image src={sparkle} alt="" width={20} height={20} aria-hidden="true" />
        <span className="AskStellar__labelText">Ask Stellar</span>
      </div>

      <div className="AskStellar__field">
        <input
          type="text"
          className="AskStellar__input"
          placeholder="Ask anything about building on Stellar..."
          aria-label="Ask anything about building on Stellar"
        />
      </div>
    </Box>

    <ul className="AskStellar__suggestions">
      {mockAskStellarSuggestions.map((suggestion) => (
        <li key={suggestion} className="AskStellar__suggestion">
          <Text as="span" size="sm">
            {suggestion}
          </Text>
        </li>
      ))}
    </ul>
  </Box>
);
