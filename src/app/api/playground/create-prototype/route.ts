import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface StartFromBlank {
  type: "blank";
  includeSidebar?: boolean;
}

interface StartFromExisting {
  type: "existing";
  sourceKey: string;
}

interface CreatePrototypeRequest {
  name: string;
  description?: string;
  startFrom?: StartFromBlank | StartFromExisting;
}

// Mapping of source keys to actual file paths
// basePath defaults to "src/app/(sidebar)" if not specified
// externalComponents: folders from src/components/ to copy into prototype's components/
const SOURCE_PAGE_MAP: Record<
  string,
  {
    path: string;
    basePath?: string;
    hasStyles?: boolean;
    hasComponents?: boolean;
    externalComponents?: string[];
  }
> = {
  // Introduction (special case - at root level, uses Home components)
  introduction: {
    path: "",
    basePath: "src/app",
    externalComponents: ["Home"],
  },
  // XDR
  "xdr-to-json": { path: "xdr/view" },
  "xdr-json-to": { path: "xdr/to" },
  "xdr-diff": { path: "xdr/diff" },
  // Account
  "account-create-keypair": { path: "account/create" },
  "account-fund": { path: "account/fund", hasComponents: true },
  "account-muxed-create": { path: "account/muxed-create" },
  "account-muxed-parse": { path: "account/muxed-parse" },
  // Transactions
  "transaction-dashboard": {
    path: "transaction/dashboard",
    hasStyles: true,
    hasComponents: true,
  },
  "transaction-build": { path: "transaction/build", hasComponents: true },
  "transaction-sign": { path: "transaction/sign", hasComponents: true },
  "transaction-fee-bump": { path: "transaction/fee-bump" },
  // Smart Contracts
  "contract-explorer": {
    path: "smart-contracts/contract-explorer",
    hasComponents: true,
  },
  "contract-list": {
    path: "smart-contracts/contract-list",
    hasComponents: true,
  },
  "contract-deploy": { path: "smart-contracts/deploy-contract" },
};

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
 * Converts kebab-case to PascalCase.
 * "my-cool-prototype" → "MyCoolPrototype"
 */
function toPascalCase(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
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

  const { name, description = "", startFrom = { type: "blank" } } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Validate startFrom
  if (startFrom.type === "existing") {
    const sourceKey = startFrom.sourceKey;
    if (!sourceKey || !SOURCE_PAGE_MAP[sourceKey]) {
      return NextResponse.json(
        { error: "Invalid source page" },
        { status: 400 },
      );
    }
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
  const pascalName = toPascalCase(slug);
  const title = name.trim();
  const desc = description.trim();
  const isExisting = startFrom.type === "existing";
  // Chrome mode: "full" for existing pages or blank with sidebar, "minimal" for blank without sidebar
  const chromeMode = isExisting
    ? "full"
    : (startFrom as StartFromBlank).includeSidebar !== false
      ? "full"
      : "minimal";

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
      chrome: chromeMode,
      startedFrom: isExisting ? (startFrom as StartFromExisting).sourceKey : null,
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

    if (startFrom.type === "existing") {
      // Copy from existing page
      const sourceKey = (startFrom as StartFromExisting).sourceKey;
      const sourceInfo = SOURCE_PAGE_MAP[sourceKey];
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
    } else {
      // Create blank prototype
      const componentsDir = path.join(prototypeDir, "components");

      const pageContent = `"use client";

import "./styles.scss";

export default function ${pascalName}Prototype() {
  return (
    <div className="${pascalName}Prototype">
      <header className="${pascalName}Prototype__header">
        <h1>${title}</h1>
        <p>${desc}</p>
      </header>

      <main className="${pascalName}Prototype__content">
        {/* Prototype content here */}
      </main>
    </div>
  );
}
`;

      const stylesContent = `.${pascalName}Prototype {
  padding: 2rem;
  max-width: 960px;
  margin: 0 auto;
}

.${pascalName}Prototype__header {
  margin-bottom: 2rem;

  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: var(--color-gray-700);
    margin: 0;
  }
}

.${pascalName}Prototype__content {
  // Add prototype-specific styles
}
`;

      fs.writeFileSync(path.join(prototypeDir, "page.tsx"), pageContent);
      fs.writeFileSync(path.join(prototypeDir, "styles.scss"), stylesContent);
      fs.mkdirSync(componentsDir);
      fs.writeFileSync(path.join(componentsDir, ".gitkeep"), "");
    }

    // Write common files (README.md, metadata.json, mock-data.ts)
    fs.writeFileSync(path.join(prototypeDir, "README.md"), readmeContent);
    fs.writeFileSync(
      path.join(prototypeDir, "metadata.json"),
      metadataContent + "\n",
    );
    fs.writeFileSync(path.join(prototypeDir, "mock-data.ts"), mockDataContent);

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
