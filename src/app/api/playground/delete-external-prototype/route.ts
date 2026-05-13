import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface DeleteExternalPrototypeRequest {
  id: string;
}

interface ExternalPrototype {
  id: string;
  name: string;
  description: string;
  url: string;
  date: string;
}

/**
 * DELETE /api/playground/delete-external-prototype
 * Removes an external prototype entry from external-prototypes.json.
 *
 * Request body: { id: string }
 * Response: { success: true } on success
 *
 * Errors:
 * - 403: Not in development mode
 * - 400: Invalid id
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
  let body: DeleteExternalPrototypeRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  const { id } = body;

  if (!id || typeof id !== "string" || id.trim().length === 0) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  // 3. Read the external prototypes JSON file
  const jsonPath = path.join(
    process.cwd(),
    "src/app/playground/external-prototypes.json",
  );

  let prototypes: ExternalPrototype[];
  try {
    const content = fs.readFileSync(jsonPath, "utf-8");
    prototypes = JSON.parse(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to read external prototypes: ${message}` },
      { status: 500 },
    );
  }

  // 4. Find and remove the prototype
  const index = prototypes.findIndex((p) => p.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: `External prototype "${id}" not found` },
      { status: 404 },
    );
  }

  prototypes.splice(index, 1);

  // 5. Write the updated JSON back
  try {
    fs.writeFileSync(jsonPath, JSON.stringify(prototypes, null, 2) + "\n");
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update external prototypes: ${message}` },
      { status: 500 },
    );
  }
}
