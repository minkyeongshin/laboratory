import Image from "next/image";
import { Text } from "@stellar/design-system";

import { CardGrid } from "../CardGrid";
import { mockExploreInspect, type ImgTheme } from "../../mock-data";

import "./styles.scss";

export const ExploreInspect = ({ imgTheme }: { imgTheme: ImgTheme }) => (
  <CardGrid columns={4} addlClassName="ExploreInspect">
    {mockExploreInspect.map((item) => (
      <CardGrid.Cell key={item.id} href={item.route}>
        <div className="ExploreInspect__image">
          <Image
            src={item.image[imgTheme]}
            alt=""
            width={76}
            height={70}
            aria-hidden="true"
          />
        </div>

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
