"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, Icon } from "@stellar/design-system";

import { Box } from "@/components/layout/Box";

import { SectionHeader } from "../SectionHeader";
import { mockSaveAndShare, type ImgTheme } from "../../mock-data";

import "./styles.scss";

export const SaveAndShare = ({ imgTheme }: { imgTheme: ImgTheme }) => {
  const router = useRouter();

  return (
    <div className="SaveAndShare">
      <Box gap="custom" customValue="16px" addlClassName="SaveAndShare__copy">
        {/* SectionHeader rather than a local heading, so this title can't
            drift from the other section titles. */}
        <SectionHeader
          title={mockSaveAndShare.title}
          description={mockSaveAndShare.description}
        />

        <div>
          <Button
            size="md"
            variant="tertiary"
            icon={<Icon.ArrowRight />}
            iconPosition="right"
            onClick={() => router.push(mockSaveAndShare.action.route)}
          >
            {mockSaveAndShare.action.label}
          </Button>
        </div>
      </Box>

      {/* TODO: this is a 1x render of a live Figma composition — there was no
          exportable asset. Designer is exporting a 2x. It will look soft on
          retina until then. */}
      <div className="SaveAndShare__art" aria-hidden="true">
        <Image src={mockSaveAndShare.image[imgTheme]} alt="" />
      </div>
    </div>
  );
};
