import { redirect } from "next/navigation";
import { exchangeGoogleCode } from "@/lib/auth-actions";

export default async function GoogleCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const { code, error } = await searchParams;

  if (error || !code) {
    redirect("/login?error=google_failed");
  }

  try {
    await exchangeGoogleCode(code);
  } catch {
    redirect("/login?error=google_failed");
  }

  redirect("/dashboard");
}
