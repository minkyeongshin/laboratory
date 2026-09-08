import { Icon, Text } from "@stellar/design-system";

import { NextLink } from "@/components/NextLink";

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
  <div className="ExploreInspect">
    {mockExploreInspect.map((item) => (
      // The whole item is the click target. Four identical "Explore" links
      // carried no information, so they're gone.
      <NextLink
        href={item.route}
        className="ExploreInspect__item"
        key={item.id}
      >
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
      </NextLink>
    ))}
  </div>
);
