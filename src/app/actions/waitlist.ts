"use server";

import { getSupabaseClient } from "@/lib/supabase";

export async function joinWaitlist(email: string): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("waitlist")
    .insert({ email, source: "marketing_page" });

  if (error) {
    if (error.code === "23505") {
      return { error: null };
    }
    console.error("Waitlist insert error:", error.message);
    return { error: "Something went wrong. Please try again." };
  }

  return { error: null };
}
