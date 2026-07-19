import { readFile } from "fs/promises";
import { join, resolve, normalize } from "path";
import { NextRequest, NextResponse } from "next/server";

const CONTENT_TYPES: Record<string, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;

  if (!path?.length) return new NextResponse(null, { status: 400 });

  // Prevent path traversal: resolve and confirm stays under uploads/
  const uploadsRoot = resolve(process.cwd(), "public", "uploads");
  const filePath = resolve(uploadsRoot, normalize(path.join("/")));
  if (!filePath.startsWith(uploadsRoot + "/") && filePath !== uploadsRoot) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const data = await readFile(filePath);
    const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=2592000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
