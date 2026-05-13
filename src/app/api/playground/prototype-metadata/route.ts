import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface PrototypeMetadata {
  title: string;
  description: string;
  author: string;
  date: string;
  status: string;
  chrome: "minimal" | "full";
  startedFrom: string | null;
}

/**
 * GET /api/playground/prototype-metadata?slug=xxx
 * Returns the metadata.json for a given prototype.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  // Validate slug (basic security check)
  if (slug.includes("..") || slug.includes("/") || slug.includes("\\")) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const metadataPath = path.join(
    process.cwd(),
    "src/app/playground/prototypes",
    slug,
    "metadata.json",
  );

  if (!fs.existsSync(metadataPath)) {
    // Return default metadata if file doesn't exist
    return NextResponse.json({
      chrome: "full", // Default to full chrome for backwards compatibility
    });
  }

  try {
    const content = fs.readFileSync(metadataPath, "utf-8");
    const metadata: PrototypeMetadata = JSON.parse(content);
    return NextResponse.json(metadata);
  } catch {
    return NextResponse.json({
      chrome: "full", // Default on error
    });
  }
}
