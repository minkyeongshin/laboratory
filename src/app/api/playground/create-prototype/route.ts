import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface CreatePrototypeRequest {
  name: string;
  description?: string;
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
 * POST /api/playground/create-prototype
 * Creates a new local prototype with boilerplate files.
 *
 * Request body: { name: string, description?: string }
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

  const { name, description = "" } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Name is required" },
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

  // 5. Prepare file contents
  const date = getTodayDate();
  const pascalName = toPascalCase(slug);
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

  const mockDataContent = `/**
 * Mock data for ${title} prototype.
 * Import types from @/types/ rather than re-declaring.
 */

// Example: import { Network } from "@/types/types";

export const mockData = {
  // Add mock data here
};
`;

  // 6. Create files atomically (cleanup on failure)
  const componentsDir = path.join(prototypeDir, "components");

  try {
    // Ensure parent prototypes directory exists
    if (!fs.existsSync(prototypesDir)) {
      fs.mkdirSync(prototypesDir, { recursive: true });
    }

    // Create prototype directory
    fs.mkdirSync(prototypeDir);

    // Create components subdirectory
    fs.mkdirSync(componentsDir);

    // Write all files
    fs.writeFileSync(path.join(prototypeDir, "README.md"), readmeContent);
    fs.writeFileSync(path.join(prototypeDir, "page.tsx"), pageContent);
    fs.writeFileSync(path.join(prototypeDir, "styles.scss"), stylesContent);
    fs.writeFileSync(path.join(prototypeDir, "mock-data.ts"), mockDataContent);
    fs.writeFileSync(path.join(componentsDir, ".gitkeep"), "");

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
