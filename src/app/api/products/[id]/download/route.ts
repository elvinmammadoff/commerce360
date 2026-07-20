import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { readdir, readFile, access, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

const execFileAsync = promisify(execFile);

async function findVideoPath(videosDir: string, id: string): Promise<string | null> {
  for (const name of [`${id}-clean.mp4`, `${id}.mp4`]) {
    try { await access(join(videosDir, name)); return join(videosDir, name); } catch {}
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const type = req.nextUrl.searchParams.get("type") ?? "video";

  const uploadsRoot = join(process.cwd(), "public", "uploads");
  const framesDir = join(uploadsRoot, "frames", id);
  const videosDir = join(uploadsRoot, "videos");

  if (type === "video") {
    const videoPath = await findVideoPath(videosDir, id);
    if (!videoPath) return new NextResponse(null, { status: 404 });
    const data = await readFile(videoPath).catch(() => null);
    if (!data) return new NextResponse(null, { status: 404 });
    return new NextResponse(data, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": data.length.toString(),
        "Content-Disposition": `attachment; filename="${id}-orbit-4k.mp4"`,
      },
    });
  }

  // frames, package, marketplace — all produce a ZIP
  const tmpZip = join(tmpdir(), `${randomUUID()}.zip`);
  try {
    const frameFiles = await readdir(framesDir)
      .then((f) => f.filter((n) => n.endsWith(".jpg")).sort().map((n) => join(framesDir, n)))
      .catch(() => [] as string[]);

    const filesToZip: string[] = [];

    if (type === "package") {
      const videoPath = await findVideoPath(videosDir, id);
      if (videoPath) filesToZip.push(videoPath);
    }

    if (type !== "video") filesToZip.push(...frameFiles);

    if (filesToZip.length === 0) return new NextResponse(null, { status: 404 });

    await execFileAsync("zip", ["-j", tmpZip, ...filesToZip]);
    const data = await readFile(tmpZip);

    const label =
      type === "package" ? "complete-package"
      : type === "marketplace" ? "marketplace-set"
      : "frames";

    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Length": data.length.toString(),
        "Content-Disposition": `attachment; filename="${id}-${label}.zip"`,
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  } finally {
    unlink(tmpZip).catch(() => {});
  }
}
