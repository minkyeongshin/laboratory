import { Heading, Text } from "@stellar/design-system";
import { Box } from "@/components/layout/Box";

import "./styles.scss";

// Heading rather than Display: the two share identical CSS in SDS
// (.Display--sm and .Heading--sm), but this is the page's h1 and Display only
// renders div/span.
//
// size="sm" is 2rem/2.5rem (32/40) with letter-spacing
// calc(font-size * .04 * -1) = -1.28px, applied by SDS with no overrides.

export const Hero = () => (
  <Box gap="custom" customValue="24px" addlClassName="Hero">
    <Heading as="h1" size="sm" weight="medium">
      {/* The design breaks the line before the em dash rather than letting it
          wrap naturally, so the break is explicit. */}
      Simulate, analyze, and explore
      <br />— all in one place
    </Heading>

    <Text as="p" size="md" addlClassName="Hero__subtitle">
      Everything you need to build and test on Stellar, right in your browser.
    </Text>
  </Box>
);
