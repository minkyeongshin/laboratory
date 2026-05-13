import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface DeletePrototypeRequest {
  slug: string;
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
 * DELETE /api/playground/delete-prototype
 * Deletes a local prototype folder.
 *
 * Request body: { slug: string }
 * Response: { success: true } on success
 *
 * Errors:
 * - 403: Not in development mode
 * - 400: Invalid slug
 * - 404: Prototype not found
 * - 500: File system error
 */
export async function DELETE(request: NextRequest) {
  // 1. Dev-only check
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 },
    );
  }

  // 2. Parse and validate request body
  let body: DeletePrototypeRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  const { slug } = body;

  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  // 3. Validate slug
  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { error: "Invalid slug format" },
      { status: 400 },
    );
  }

  // 4. Build path and check existence
  const prototypeDir = path.join(
    process.cwd(),
    "src/app/playground/prototypes",
    slug,
  );

  if (!fs.existsSync(prototypeDir)) {
    return NextResponse.json(
      { error: `Prototype "${slug}" not found` },
      { status: 404 },
    );
  }

  // 5. Verify it's a directory (extra safety)
  const stats = fs.statSync(prototypeDir);
  if (!stats.isDirectory()) {
    return NextResponse.json(
      { error: "Invalid prototype path" },
      { status: 400 },
    );
  }

  // 6. Delete the folder
  try {
    fs.rmSync(prototypeDir, { recursive: true, force: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to delete prototype: ${message}` },
      { status: 500 },
    );
  }
}
