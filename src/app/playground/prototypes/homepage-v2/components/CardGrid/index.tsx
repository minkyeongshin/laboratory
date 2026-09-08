import React from "react";
import { NextLink } from "@/components/NextLink";

import "./styles.scss";

// Created instead of using SDS <Card> because:
// - <Card> renders a single bordered box with fixed padding and only
//   borderRadiusSize "sm" | "md". Home v2 needs one r16 container whose cells
//   are separated by 1px dividers with no gaps between them.
// - Composing N <Card>s gives N independent borders, so every seam is 2px and
//   there is a gap where the design has a hairline.
// - Teaching <Card> to group itself into columns would push multi-column layout
//   into a leaf component. Wrong altitude.
//
// Dividers are the grid gaps: the container paints the border colour and the
// cells paint over it, so a 1px gap reads as a hairline. This keeps dividers
// correct when the grid collapses at narrow widths, which per-cell borders
// would not.

type CardGridProps = {
  /** Number of columns at full width. Collapses to 2, then 1. */
  columns: 3 | 4;
  /**
   * "bordered" is the boxed card row. "open" drops the outer border and radius
   * but keeps identical column math, dividers and 24px cell padding — one
   * component at two densities.
   */
  variant?: "bordered" | "open";
  children: React.ReactNode;
  addlClassName?: string;
};

type CardGridCellProps = {
  children: React.ReactNode;
  addlClassName?: string;
  /** When set, the whole cell becomes a link. */
  href?: string;
};

const CardGridCell = ({ children, addlClassName, href }: CardGridCellProps) => {
  const className = `CardGrid__cell ${addlClassName ?? ""}`;

  if (href) {
    return (
      <NextLink href={href} className={className} data-is-link="true">
        {children}
      </NextLink>
    );
  }

  return <div className={className}>{children}</div>;
};

export const CardGrid = ({
  columns,
  variant = "bordered",
  children,
  addlClassName,
}: CardGridProps) => (
  <div
    className={`CardGrid ${addlClassName ?? ""}`}
    data-columns={columns}
    data-variant={variant}
  >
    {children}
  </div>
);

CardGrid.Cell = CardGridCell;
