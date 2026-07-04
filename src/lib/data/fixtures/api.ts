import type { ApiEndpoint, ApiKey } from "@/lib/types";

export const apiKeys: ApiKey[] = [
  {
    id: "key_01",
    name: "Production",
    maskedKey: "c360_live_••••••••4f2a",
    createdAt: "2026-06-29T17:40:00Z",
    lastUsedAt: "2026-07-04T10:58:00Z",
    requestsThisMonth: 1204,
    status: "active",
  },
  {
    id: "key_02",
    name: "Staging",
    maskedKey: "c360_test_••••••••9c1d",
    createdAt: "2026-06-29T17:42:00Z",
    lastUsedAt: "2026-07-02T08:15:00Z",
    requestsThisMonth: 86,
    status: "active",
  },
];

export const apiEndpoints: ApiEndpoint[] = [
  {
    method: "POST",
    path: "/v1/products",
    summary: "Create a product from a source image",
    description:
      "Uploads a source image and starts the render pipeline. Returns the product with a job id you can poll or subscribe to via webhooks.",
  },
  {
    method: "GET",
    path: "/v1/products/{id}",
    summary: "Retrieve a product and its assets",
    description:
      "Returns product metadata plus asset URLs — orbit video, frame set, and marketplace images — once the render has completed.",
  },
  {
    method: "GET",
    path: "/v1/jobs/{id}",
    summary: "Check render progress",
    description:
      "Returns job status, current pipeline stage, and overall progress. Poll at 5s intervals or use the job.completed webhook.",
  },
  {
    method: "GET",
    path: "/v1/products",
    summary: "List products",
    description:
      "Paginated list of all products in the workspace, filterable by status and category.",
  },
  {
    method: "DELETE",
    path: "/v1/products/{id}",
    summary: "Delete a product",
    description:
      "Removes the product and all generated assets. This cannot be undone; credits are not refunded.",
  },
];

export const apiCodeSamples = {
  curl: `curl -X POST https://api.commerce360.ai/v1/products \\
  -H "Authorization: Bearer $C360_API_KEY" \\
  -F "source=@vireo-oxblood-hero.jpg" \\
  -F "name=Vireo Lounge Chair — Walnut" \\
  -F "preset=studio-white" \\
  -F "output=frames-72,video-4k,marketplace"`,
  node: `import Commerce360 from "@commerce360/sdk";

const c360 = new Commerce360(process.env.C360_API_KEY);

const product = await c360.products.create({
  source: fs.createReadStream("vireo-oxblood-hero.jpg"),
  name: "Vireo Lounge Chair — Walnut",
  preset: "studio-white",
  output: ["frames-72", "video-4k", "marketplace"],
});

const job = await c360.jobs.waitFor(product.jobId);
console.log(job.assets.orbitVideoUrl);`,
  python: `from commerce360 import Client

c360 = Client(api_key=os.environ["C360_API_KEY"])

product = c360.products.create(
    source=open("vireo-oxblood-hero.jpg", "rb"),
    name="Vireo Lounge Chair — Walnut",
    preset="studio-white",
    output=["frames-72", "video-4k", "marketplace"],
)

job = c360.jobs.wait_for(product.job_id)
print(job.assets.orbit_video_url)`,
} as const;
