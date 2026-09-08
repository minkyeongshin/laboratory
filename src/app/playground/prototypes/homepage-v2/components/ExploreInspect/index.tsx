import { Text } from "@stellar/design-system";

import { CardGrid } from "../CardGrid";
import { mockExploreInspect } from "../../mock-data";

import "./styles.scss";

export const ExploreInspect = () => (
  <CardGrid columns={4} addlClassName="ExploreInspect">
    {mockExploreInspect.map((item) => (
      <CardGrid.Cell key={item.id} href={item.route}>
        <Text as="div" size="sm" weight="medium">
          {item.title}
        </Text>

        <Text as="p" size="xs" addlClassName="ExploreInspect__description">
          {item.description}
        </Text>
      </CardGrid.Cell>
    ))}
  </CardGrid>
);
