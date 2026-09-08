import { Heading, Text } from "@stellar/design-system";
import { Box } from "@/components/layout/Box";

import "./styles.scss";

// Heading rather than Display: the two share identical CSS in SDS
// (.Display--md and .Heading--md), but this is the page's h1 and Display only
// renders div/span.
//
// size="md" weight="medium" needs no overrides — SDS gives 2.5rem/3rem (40/48)
// and letter-spacing: calc(font-size * .04 * -1) = -1.6px, which is exactly the
// Figma spec.

export const Hero = () => (
  <Box gap="custom" customValue="24px" addlClassName="Hero">
    <Heading as="h1" size="md" weight="medium">
      Simulate, analyze, and explore — all in one place
    </Heading>

    <Text as="p" size="sm" addlClassName="Hero__subtitle">
      The all-in-one web tool to build, sign, simulate, and submit transactions
      and interact with contracts on the Stellar network.
    </Text>
  </Box>
);
