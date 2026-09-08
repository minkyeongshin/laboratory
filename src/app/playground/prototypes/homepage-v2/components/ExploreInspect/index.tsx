import { Icon, Text } from "@stellar/design-system";

import { CardGrid } from "../CardGrid";
import { mockExploreInspect } from "../../mock-data";

import "./styles.scss";

// A 20px icon above the title is what separates these cards from Start
// building, which is title + arrow. Glyphs chosen so no two read as "code":
// transfer, module, server, code.
const ICONS: Record<string, React.ReactNode> = {
  transactions: <Icon.SwitchHorizontal01 />,
  "smart-contracts": <Icon.Cube01 />,
  "api-explorer": <Icon.Server01 />,
  "xdr-tools": <Icon.Code01 />,
};

export const ExploreInspect = () => (
  <CardGrid columns={4} addlClassName="ExploreInspect">
    {mockExploreInspect.map((item) => (
      <CardGrid.Cell key={item.id} href={item.route}>
        <span className="ExploreInspect__icon" aria-hidden="true">
          {ICONS[item.id]}
        </span>

        <Text
          as="div"
          size="sm"
          weight="medium"
          addlClassName="ExploreInspect__title"
        >
          {item.title}
        </Text>

        <Text as="p" size="sm" addlClassName="ExploreInspect__description">
          {item.description}
        </Text>
      </CardGrid.Cell>
    ))}
  </CardGrid>
);
