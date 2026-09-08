import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

import { SOURCE_PAGE_MAP } from "@/constants/playgroundSourcePages";

interface StartFromExisting {
  type: "existing";
  sourceKey: string;
}

interface CreatePrototypeRequest {
  name: string;
  description?: string;
  startFrom: StartFromExisting;
}

/**
 * Converts a name to a kebab-case slug.
 * "My Cool Prototype" → "my-cool-prototype"
 */
function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing dashes
}

/**
 * Validates that a slug is safe (no path traversal, valid kebab-case).
 */
function isValidSlug(slug: string): boolean {
  // Must be non-empty
  if (!slug || slug.length === 0) {
    return false;
  }

  // Must be kebab-case only (lowercase letters, numbers, single dashes)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return false;
  }

  // No path traversal patterns
  if (slug.includes("..") || slug.includes("/") || slug.includes("\\")) {
    return false;
  }

  // Reasonable length limit
  if (slug.length > 100) {
    return false;
  }

  return true;
}

/**
 * Returns today's date in YYYY-MM-DD format.
 */
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Recursively copies a directory.
 */
function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Adjusts import paths in a file.
 * - Changes "../styles.scss" to "./parent-styles.scss"
 * - Changes "@/components/{folder}/" to "./components/{folder}/" for external components
 */
function adjustImports(
  filePath: string,
  sourceDir: string,
  externalComponents?: string[],
): void {
  let content = fs.readFileSync(filePath, "utf-8");

  // Check if source had a parent styles.scss that we need to copy
  const parentStylesPath = path.join(sourceDir, "..", "styles.scss");
  if (
    content.includes('../styles.scss"') ||
    content.includes("../styles.scss'")
  ) {
    // Replace relative parent import with local import
    content = content.replace(
      /['"]\.\.\/styles\.scss['"]/g,
      '"./parent-styles.scss"',
    );

    // Copy parent styles.scss if it exists
    if (fs.existsSync(parentStylesPath)) {
      const destDir = path.dirname(filePath);
      fs.copyFileSync(parentStylesPath, path.join(destDir, "parent-styles.scss"));
    }
  }

  // Adjust imports for external components (e.g., @/components/Home/ → ./components/Home/)
  if (externalComponents && externalComponents.length > 0) {
    for (const folder of externalComponents) {
      // Match both single and double quotes, with or without specific file
      const regex = new RegExp(
        `(['"])@/components/${folder}/([^'"]*?)(['"])`,
        "g",
      );
      content = content.replace(regex, `$1./components/${folder}/$2$3`);
    }
  }

  fs.writeFileSync(filePath, content);
}

/**
 * POST /api/playground/create-prototype
 * Creates a new local prototype with boilerplate files.
 *
 * Request body: { name: string, description?: string, startFrom?: { type: "blank" } | { type: "existing", sourceKey: string } }
 * Response: { slug: string } on success
 *
 * Errors:
 * - 403: Not in development mode
 * - 400: Invalid input
 * - 409: Prototype already exists
 * - 500: File system error
 */
export async function POST(request: NextRequest) {
  // 1. Dev-only check
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 },
    );
  }

  // 2. Parse and validate request body
  let body: CreatePrototypeRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  const { name, description = "", startFrom } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Validate startFrom - must be provided and reference a valid source page
  if (!startFrom || startFrom.type !== "existing") {
    return NextResponse.json(
      { error: "Source page selection is required" },
      { status: 400 },
    );
  }

  const sourceKey = startFrom.sourceKey;
  if (!sourceKey || !SOURCE_PAGE_MAP[sourceKey]) {
    return NextResponse.json(
      { error: "Invalid source page" },
      { status: 400 },
    );
  }

  // 3. Generate and validate slug
  const slug = toKebabCase(name);

  if (!isValidSlug(slug)) {
    return NextResponse.json(
      {
        error:
          "Invalid name. Use only letters, numbers, and spaces. Result must be a valid kebab-case slug.",
      },
      { status: 400 },
    );
  }

  // 4. Check if prototype already exists
  const prototypesDir = path.join(
    process.cwd(),
    "src/app/playground/prototypes",
  );
  const prototypeDir = path.join(prototypesDir, slug);

  if (fs.existsSync(prototypeDir)) {
    return NextResponse.json(
      { error: `Prototype "${slug}" already exists` },
      { status: 409 },
    );
  }

  // 5. Prepare common content
  const date = getTodayDate();
  const title = name.trim();
  const desc = description.trim();

  const readmeContent = `---
title: ${title}
description: ${desc}
author: minkyeong
date: ${date}
status: exploring
---

## What this proves

${desc || "(To be filled in)"}

## What it doesn't cover

(To be filled in)
`;

  const metadataContent = JSON.stringify(
    {
      title,
      description: desc,
      author: "minkyeong",
      date,
      status: "exploring",
      chrome: "full",
      startedFrom: startFrom.sourceKey,
    },
    null,
    2,
  );

  const mockDataContent = `/**
 * Mock data for ${title} prototype.
 * Import types from @/types/ rather than re-declaring.
 */

// Example: import { Network } from "@/types/types";

export const mockData = {
  // Add mock data here
};
`;

  // 6. Create files
  try {
    // Ensure parent prototypes directory exists
    if (!fs.existsSync(prototypesDir)) {
      fs.mkdirSync(prototypesDir, { recursive: true });
    }

    // Create prototype directory
    fs.mkdirSync(prototypeDir);

    // Copy from existing page
    const sourceInfo = SOURCE_PAGE_MAP[startFrom.sourceKey];
    const basePath = sourceInfo.basePath || "src/app/(sidebar)";
    const sourceDir = path.join(process.cwd(), basePath, sourceInfo.path);

    // Copy page.tsx
    const sourcePagePath = path.join(sourceDir, "page.tsx");
    if (fs.existsSync(sourcePagePath)) {
      fs.copyFileSync(sourcePagePath, path.join(prototypeDir, "page.tsx"));
      adjustImports(
        path.join(prototypeDir, "page.tsx"),
        sourceDir,
        sourceInfo.externalComponents,
      );
    }

    // Copy styles.scss if exists
    const sourceStylesPath = path.join(sourceDir, "styles.scss");
    if (fs.existsSync(sourceStylesPath)) {
      fs.copyFileSync(
        sourceStylesPath,
        path.join(prototypeDir, "styles.scss"),
      );
    }

    // Copy components directory if exists (co-located with page)
    const sourceComponentsDir = path.join(sourceDir, "components");
    if (fs.existsSync(sourceComponentsDir)) {
      copyDir(sourceComponentsDir, path.join(prototypeDir, "components"));
    }

    // Copy external components from src/components/
    if (sourceInfo.externalComponents && sourceInfo.externalComponents.length > 0) {
      const prototypeComponentsDir = path.join(prototypeDir, "components");
      if (!fs.existsSync(prototypeComponentsDir)) {
        fs.mkdirSync(prototypeComponentsDir);
      }
      for (const folder of sourceInfo.externalComponents) {
        const externalDir = path.join(process.cwd(), "src/components", folder);
        if (fs.existsSync(externalDir)) {
          copyDir(externalDir, path.join(prototypeComponentsDir, folder));
        }
      }
    }

    // Ensure components directory exists (create with .gitkeep if empty)
    const prototypeComponentsDir = path.join(prototypeDir, "components");
    if (!fs.existsSync(prototypeComponentsDir)) {
      fs.mkdirSync(prototypeComponentsDir);
      fs.writeFileSync(path.join(prototypeComponentsDir, ".gitkeep"), "");
    }

    // Write common files (README.md, metadata.json, mock-data.ts)
    fs.writeFileSync(path.join(prototypeDir, "README.md"), readmeContent);
    fs.writeFileSync(
      path.join(prototypeDir, "metadata.json"),
      metadataContent + "\n",
    );
    fs.writeFileSync(path.join(prototypeDir, "mock-data.ts"), mockDataContent);

    // Pre-warm the route by fetching it, triggering Next.js compilation
    // This ensures the route is ready when the user's new tab opens
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const prototypeUrl = `${protocol}://${host}/playground/prototypes/${slug}`;

    try {
      await fetch(prototypeUrl, {
        method: "GET",
        signal: AbortSignal.timeout(15000), // 15s timeout for compilation
      });
    } catch {
      // Ignore errors — the route is now registered regardless of response status
      // Even a 500 during initial render means Next.js has compiled the route
    }

    return NextResponse.json({ slug });
  } catch (error) {
    // Cleanup: remove partially created directory
    try {
      if (fs.existsSync(prototypeDir)) {
        fs.rmSync(prototypeDir, { recursive: true, force: true });
      }
    } catch {
      // Cleanup failed — log but don't throw
      console.error("Failed to cleanup after error:", prototypeDir);
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create prototype: ${message}` },
      { status: 500 },
    );
  }
}
