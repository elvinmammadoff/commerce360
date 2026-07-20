import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { readdir, readFile, access, stat } from "fs/promises";
import { join } from "path";

async function findVideoPath(videosDir: string, id: string): Promise<string | null> {
  for (const name of [`${id}-clean.mp4`, `${id}.mp4`]) {
    try { await access(join(videosDir, name)); return join(videosDir, name); } catch {}
  }
  return null;
}

async function listFrameFiles(framesDir: string): Promise<string[]> {
  return readdir(framesDir)
    .then((f) => f.filter((n) => n.endsWith(".jpg")).sort().map((n) => join(framesDir, n)))
    .catch(() => [] as string[]);
}

async function sumBytes(files: string[]): Promise<number> {
  let total = 0;
  for (const f of files) {
    try { total += (await stat(f)).size; } catch {}
  }
  return total;
}

const toMb = (bytes: number) => Math.round((bytes / 1_048_576) * 10) / 10;

/** Build a ZIP in-memory from the given files (flat, no directory paths). */
async function zipFiles(files: string[]): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const f of files) {
    const buf = await readFile(f).catch(() => null);
    if (buf) zip.file(f.split("/").pop() ?? "file", buf);
  }
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 } });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const type = req.nextUrl.searchParams.get("type") ?? "video";
  const meta = req.nextUrl.searchParams.get("meta");

  const uploadsRoot = join(process.cwd(), "public", "uploads");
  const framesDir = join(uploadsRoot, "frames", id);
  const videosDir = join(uploadsRoot, "videos");

  // Real, on-disk sizes for the downloads panel — replaces the estimates
  // stored in the product assets record (which are often 0).
  if (meta === "1") {
    const videoPath = await findVideoPath(videosDir, id);
    const videoBytes = videoPath ? await sumBytes([videoPath]) : 0;
    const frameFiles = await listFrameFiles(framesDir);
    const framesBytes = await sumBytes(frameFiles);
    return NextResponse.json({
      video: toMb(videoBytes),
      frames: toMb(framesBytes),
      package: toMb(videoBytes + framesBytes),
      marketplace: toMb(framesBytes),
    });
  }

  if (type === "video") {
    const videoPath = await findVideoPath(videosDir, id);
    if (!videoPath) return new NextResponse(null, { status: 404 });
    const buf = await readFile(videoPath).catch(() => null);
    if (!buf) return new NextResponse(null, { status: 404 });
    const data = new Uint8Array(buf);
    return new NextResponse(data, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": data.length.toString(),
        "Content-Disposition": `attachment; filename="${id}-orbit-4k.mp4"`,
      },
    });
  }

  // frames, package, marketplace — all produce a ZIP
  const frameFiles = await listFrameFiles(framesDir);
  const filesToZip: string[] = [];

  if (type === "package") {
    const videoPath = await findVideoPath(videosDir, id);
    if (videoPath) filesToZip.push(videoPath);
  }
  filesToZip.push(...frameFiles);

  if (filesToZip.length === 0) return new NextResponse(null, { status: 404 });

  try {
    const data = new Uint8Array(await zipFiles(filesToZip));
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
  }
}
