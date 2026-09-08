"use client";

import { Button, Icon, Text } from "@stellar/design-system";

import { Box } from "@/components/layout/Box";
import { NetworkIndicator } from "@/components/NetworkIndicator";
import { openUrl } from "@/helpers/openUrl";
import { useStore } from "@/store/useStore";

import { CardGrid } from "../CardGrid";
import { mockNetworks } from "../../mock-data";

import "./styles.scss";

// NetworkIndicator is reused as-is rather than rebuilt: it already renders the
// 6px dot at 14/20 weight-medium with per-network colours (mainnet = lime-09),
// which is exactly the Figma spec. Its dot gap is 4px against Figma's 6px —
// not worth an override.
//
// Button size="md" is 32px against Figma's 36px. SDS has no 36px step (md=32,
// lg=40); md is the closer match and reads correctly against the card.

export const NetworkPicker = () => {
  const { network } = useStore();

  return (
    <CardGrid columns={3} addlClassName="NetworkPicker">
      {mockNetworks.map((item) => {
        const isActive = network.id === item.id;

        return (
          <CardGrid.Cell key={item.id}>
            <Box gap="custom" customValue="4px">
              <NetworkIndicator networkId={item.id} networkLabel={item.title} />

              <Text as="p" size="sm" addlClassName="NetworkPicker__description">
                {item.description}
              </Text>
            </Box>

            <div className="NetworkPicker__actions">
              {isActive ? (
                <div className="NetworkPicker__status">
                  <Icon.CheckCircle />
                  <Text as="span" size="xs" weight="medium">
                    {`You’re on ${item.title}`}
                  </Text>
                </div>
              ) : (
                item.actions.map((action) => (
                  <Button
                    key={`${item.id}-${action.label}`}
                    size="md"
                    variant="tertiary"
                    icon={<Icon.ArrowRight />}
                    iconPosition="right"
                    onClick={() => {
                      if (action.url) {
                        openUrl(action.url);
                      }
                      // TODO: switching is a no-op in the prototype. Wiring
                      // useSwitchNetwork would make this a real feature, which
                      // playground rules put out of scope.
                    }}
                  >
                    {action.label}
                  </Button>
                ))
              )}
            </div>
          </CardGrid.Cell>
        );
      })}
    </CardGrid>
  );
};
