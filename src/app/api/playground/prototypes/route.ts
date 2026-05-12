import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface ExternalPrototype {
  id: string;
  name: string;
  description: string;
  url: string;
  date: string;
}

interface PlaygroundPrototype {
  id: string;
  name: string;
  description: string;
  date: string;
  type: "local" | "external";
  href: string;
}

/**
 * Parses YAML frontmatter from markdown content.
 * Simple parser — handles basic key: value pairs only.
 */
function parseFrontmatter(content: string): Record<string, string> {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return {};
  }

  const frontmatter: Record<string, string> = {};
  const lines = frontmatterMatch[1].split("\n");

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      frontmatter[key] = value;
    }
  }

  return frontmatter;
}

/**
 * GET /api/playground/prototypes
 * Returns merged list of local and external prototypes.
 */
export async function GET() {
  const prototypes: PlaygroundPrototype[] = [];

  // 1. Read external prototypes from JSON
  const externalPath = path.join(
    process.cwd(),
    "src/app/playground/external-prototypes.json",
  );

  try {
    const externalContent = fs.readFileSync(externalPath, "utf-8");
    const externalPrototypes: ExternalPrototype[] = JSON.parse(externalContent);

    for (const ext of externalPrototypes) {
      prototypes.push({
        id: ext.id,
        name: ext.name,
        description: ext.description,
        date: ext.date,
        type: "external",
        href: ext.url,
      });
    }
  } catch {
    // File doesn't exist or is invalid — continue without external prototypes
  }

  // 2. Scan local prototypes folder
  const prototypesDir = path.join(
    process.cwd(),
    "src/app/playground/prototypes",
  );

  try {
    if (fs.existsSync(prototypesDir)) {
      const entries = fs.readdirSync(prototypesDir, { withFileTypes: true });

      for (const entry of entries) {
        // Skip non-directories and hidden files
        if (!entry.isDirectory() || entry.name.startsWith(".")) {
          continue;
        }

        // Skip _archive folder
        if (entry.name === "_archive") {
          continue;
        }

        const slug = entry.name;
        const readmePath = path.join(prototypesDir, slug, "README.md");

        if (fs.existsSync(readmePath)) {
          const readmeContent = fs.readFileSync(readmePath, "utf-8");
          const frontmatter = parseFrontmatter(readmeContent);

          prototypes.push({
            id: slug,
            name: frontmatter.title || slug,
            description: frontmatter.description || "",
            date: frontmatter.date || "",
            type: "local",
            href: `/playground/prototypes/${slug}`,
          });
        } else {
          // No README — use slug as name
          prototypes.push({
            id: slug,
            name: slug,
            description: "",
            date: "",
            type: "local",
            href: `/playground/prototypes/${slug}`,
          });
        }
      }
    }
  } catch {
    // Error scanning directory — continue with what we have
  }

  // Sort by date (newest first), then by name
  prototypes.sort((a, b) => {
    if (a.date && b.date) {
      return b.date.localeCompare(a.date);
    }
    if (a.date) return -1;
    if (b.date) return 1;
    return a.name.localeCompare(b.name);
  });

  return NextResponse.json(prototypes);
}
