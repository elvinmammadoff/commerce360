import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import Replicate from "replicate";

export interface Geo3DResult {
  localPath: string;
  servedUrl: string;
  sizeMb: number;
}

/**
 * Stage — Generate a textured 3D GLB model from the normalized product image.
 *
 * Uses Hunyuan 3D 3.1 (tencent/hunyuan-3d-3.1) via Replicate.
 * The model is downloaded and saved to public/uploads/models/{productId}/model.glb
 * so it can be served via /api/uploads and loaded by the in-browser 3D viewer.
 *
 * Requires REPLICATE_API_TOKEN env var.
 * Average completion time: ~145 seconds.
 */
export async function generate3DModel(
  normalizedImageUrl: string,
  productId: string,
  onProgress?: (pct: number) => void,
): Promise<Geo3DResult> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) throw new Error("REPLICATE_API_TOKEN not set");

  const replicate = new Replicate({ auth: apiToken });

  onProgress?.(5);

  // Submit prediction — replicate.run() polls until completion
  const output = await replicate.run(
    "tencent/hunyuan-3d-3.1:a2838628b41a2e0ee2eb19b3ea98a40d75f8d7639bf5a1ddd37ea299bb334854",
    {
      input: {
        image: normalizedImageUrl,
        enable_pbr: false,
        face_count: 500000,
        generate_type: "Normal",
      },
    },
  ) as unknown as string;

  onProgress?.(80);

  // Download GLB
  const res = await fetch(output);
  if (!res.ok) throw new Error(`GLB download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());

  const modelsDir = join(process.cwd(), "public", "uploads", "models", productId);
  await mkdir(modelsDir, { recursive: true });
  const localPath = join(modelsDir, "model.glb");
  await writeFile(localPath, buf);

  const APP_URL = (process.env.NEXT_PUBLIC_SHARE_URL ?? "https://orbittify.com").replace(/\/$/, "");
  const servedUrl = `${APP_URL}/api/uploads/models/${productId}/model.glb`;
  const sizeMb = Math.round((buf.length / 1_048_576) * 10) / 10;

  onProgress?.(100);

  return { localPath, servedUrl, sizeMb };
}
