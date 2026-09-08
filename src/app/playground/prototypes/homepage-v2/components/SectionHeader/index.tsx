import { Text } from "@stellar/design-system";
import { Box } from "@/components/layout/Box";

import "./styles.scss";

// Created instead of reusing <HomeSection> from src/components/Home/Section.tsx
// because:
// - That component always renders an eyebrow slot and a Heading at size "xs"
//   (24/32). Home v2 has no eyebrow and its section headings are 16/24/600,
//   which is a Text size, not a Heading size.
// - Its description is Text size "md" (16/24); Home v2's is 12/18.
// - It also wraps children in its own padded section container, which conflicts
//   with the page-level spacing here.
// Every prop of the existing component would need to change meaning, so this is
// a different component rather than an extension.

export const SectionHeader = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => (
  <Box gap="xs" addlClassName="SectionHeader">
    <Text as="h2" size="md" weight="medium">
      {title}
    </Text>

    {description ? (
      <Text as="p" size="xs" addlClassName="SectionHeader__description">
        {description}
      </Text>
    ) : null}
  </Box>
);
