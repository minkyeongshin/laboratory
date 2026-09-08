import { Icon, Text } from "@stellar/design-system";

import { CardGrid } from "../CardGrid";
import { mockExploreInspect } from "../../mock-data";

import "./styles.scss";

// Glyphs chosen so no two read as "code": transfer, module, server, code.
const ICONS: Record<string, React.ReactNode> = {
  transactions: <Icon.SwitchHorizontal01 />,
  "smart-contracts": <Icon.Cube01 />,
  "api-explorer": <Icon.Server01 />,
  "xdr-tools": <Icon.Code01 />,
};

export const ExploreInspect = () => (
  // CardGrid variant="open": same column math, dividers and 24px inset as the
  // Start building row, without the outer box. The dividers and the content
  // inset come from CardGrid rather than being reimplemented here.
  <CardGrid columns={4} variant="open" addlClassName="ExploreInspect">
    {mockExploreInspect.map((item) => (
      // The whole cell is the click target. Four identical "Explore" links
      // carried no information, so they're gone.
      <CardGrid.Cell key={item.id} href={item.route}>
        <span className="ExploreInspect__tile" aria-hidden="true">
          {ICONS[item.id]}
        </span>

        {/* One paragraph: bold title, period, then the description inline.
            `as="div"` rather than `as="p"` because SDS gives every <p> a
            24px bottom margin that would fight the spacing here. */}
        <Text as="div" size="sm" addlClassName="ExploreInspect__body">
          <strong className="ExploreInspect__title">{item.title}.</strong>{" "}
          {item.description}
        </Text>
      </CardGrid.Cell>
    ))}
  </CardGrid>
);
