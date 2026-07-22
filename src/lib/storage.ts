import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET ?? "orbittify-uploads";
const PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? "https://uploads.orbittify.com").replace(/\/$/, "");

export async function uploadImage(file: File): Promise<string> {
  const raw = Buffer.from(await file.arrayBuffer());

  const optimized = await sharp(raw)
    .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();

  const key = `uploads/${randomUUID()}.jpg`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: optimized,
      ContentType: "image/jpeg",
    }),
  );

  return `${PUBLIC_URL}/${key}`;
}
