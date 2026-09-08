"use client";

import Image from "next/image";
import { Button, Icon, Text } from "@stellar/design-system";

import { Box } from "@/components/layout/Box";
import { NextLink } from "@/components/NextLink";
import { openUrl } from "@/helpers/openUrl";

import { CardGrid } from "../CardGrid";
import {
  mockTutorials,
  TUTORIALS_PLAYLIST_URL,
  type ImgTheme,
} from "../../mock-data";

import "./styles.scss";

export const LearnByBuilding = ({ imgTheme }: { imgTheme: ImgTheme }) => (
  <Box gap="custom" customValue="8px" addlClassName="LearnByBuilding">
    <CardGrid columns={3}>
      {mockTutorials.map((item) => (
        <CardGrid.Cell key={item.id}>
          {/* NextLink, not <Button>: this navigates to YouTube, and SDS button
              chrome (background, border, fixed height) would fight the
              full-bleed thumbnail. NextLink adds target/rel for external hrefs
              and no styling of its own. */}
          <NextLink
            href={item.youTubeLink}
            className="LearnByBuilding__thumbnail"
            aria-label={`Watch: ${item.title}`}
          >
            <Image src={item.image[imgTheme]} alt="" aria-hidden="true" />
            <span className="LearnByBuilding__play" aria-hidden="true">
              <Icon.PlayCircle />
            </span>
          </NextLink>

          <Text
            as="div"
            size="sm"
            weight="medium"
            addlClassName="LearnByBuilding__title"
          >
            {item.title}
          </Text>

          <Text as="p" size="sm" addlClassName="LearnByBuilding__description">
            {item.description}
          </Text>
        </CardGrid.Cell>
      ))}
    </CardGrid>

    <div className="LearnByBuilding__viewAll">
      <Button
        size="md"
        variant="tertiary"
        icon={<Icon.ArrowRight />}
        iconPosition="right"
        onClick={() => openUrl(TUTORIALS_PLAYLIST_URL)}
      >
        View all tutorials
      </Button>
    </div>
  </Box>
);
