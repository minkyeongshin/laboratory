import { Icon, Text } from "@stellar/design-system";

import { CardGrid } from "../CardGrid";
import { mockStartBuilding } from "../../mock-data";

import "./styles.scss";

export const StartBuilding = () => (
  <CardGrid columns={4} addlClassName="StartBuilding">
    {mockStartBuilding.map((item) => (
      <CardGrid.Cell key={item.id} href={item.route}>
        <div className="StartBuilding__heading">
          <Text as="div" size="sm" weight="medium">
            {item.title}
          </Text>
          {/* SDS Icon.ArrowRight matches the exported Figma glyph, so the
              exported asset was dropped rather than committed. */}
          <Icon.ArrowRight />
        </div>

        <Text as="p" size="xs" addlClassName="StartBuilding__description">
          {item.description}
        </Text>
      </CardGrid.Cell>
    ))}
  </CardGrid>
);
