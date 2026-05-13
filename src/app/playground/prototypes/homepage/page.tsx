"use client";

import { Button, Card, Icon, Text } from "@stellar/design-system";

import { Box } from "@/components/layout/Box";

import "./styles.scss";

export default function HomepagePrototype() {
  return (
    <div className="HomepagePrototype">
      <Box gap="xl">
        {/* Section 1: Intro */}
        <section className="HomepagePrototype__intro">
          <Text as="p" size="lg">
            Stellar Lab is a developer tool for building, signing, and
            submitting transactions on the Stellar network. Use the sidebar to
            access tools.
          </Text>
        </section>

        {/* Section 2: New here? callout */}
        <Card>
          <Box gap="md">
            <Text as="p" size="sm" weight="semi-bold">
              New to Stellar?
            </Text>
            <Text as="p" size="sm">
              Learn how to get started with the Stellar network and build your
              first application.
            </Text>
            <Button
              size="sm"
              variant="tertiary"
              icon={<Icon.LinkExternal01 />}
              onClick={() =>
                window.open("https://developers.stellar.org/docs", "_blank")
              }
            >
              Read the docs
            </Button>
          </Box>
        </Card>
      </Box>
    </div>
  );
}
