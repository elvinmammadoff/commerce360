import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the network-touching layers so tests are deterministic and offline.
vi.mock("./mx", () => ({ domainHasMx: vi.fn() }));
vi.mock("./rate-limit", () => ({ checkRateLimit: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ getSupabaseClient: vi.fn() }));

import { getSupabaseClient } from "@/lib/supabase";

import { WAITLIST_MESSAGES } from "./messages";
import { domainHasMx } from "./mx";
import { checkRateLimit } from "./rate-limit";
import { submitWaitlist } from "./submit";

const insert = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  insert.mockResolvedValue({ error: null });
  vi.mocked(getSupabaseClient).mockReturnValue({
    from: () => ({ insert }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  vi.mocked(domainHasMx).mockResolvedValue(true);
  vi.mocked(checkRateLimit).mockResolvedValue("ok");
});

const base = { ip: "1.2.3.4" as const };

describe("submitWaitlist", () => {
  it("rejects invalid syntax without inserting", async () => {
    const res = await submitWaitlist({ ...base, email: "notanemail" });
    expect(res.error).toBe(WAITLIST_MESSAGES.invalidSyntax);
    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects disposable domains without inserting", async () => {
    const res = await submitWaitlist({ ...base, email: "bot@mailinator.com" });
    expect(res.error).toBe(WAITLIST_MESSAGES.disposable);
    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects fake domains with no MX record", async () => {
    vi.mocked(domainHasMx).mockResolvedValue(false);
    const res = await submitWaitlist({ ...base, email: "user@qwerty-nope.com" });
    expect(res.error).toBe(WAITLIST_MESSAGES.mxUnverifiable);
    expect(insert).not.toHaveBeenCalled();
  });

  it("returns the duplicate message when the email already exists (23505)", async () => {
    insert.mockResolvedValue({ error: { code: "23505", message: "dup" } });
    const res = await submitWaitlist({ ...base, email: "you@company.com" });
    expect(res.error).toBe(WAITLIST_MESSAGES.duplicate);
  });

  it("succeeds for a valid email and inserts the normalized address", async () => {
    const res = await submitWaitlist({ ...base, email: "  You@Company.COM " });
    expect(res.error).toBeNull();
    expect(insert).toHaveBeenCalledWith({
      email: "you@company.com",
      source: "marketing_page",
    });
  });

  it("returns fake success and writes nothing when the honeypot is filled", async () => {
    const res = await submitWaitlist({
      ...base,
      email: "you@company.com",
      honeypot: "ACME Inc",
    });
    expect(res.error).toBeNull();
    expect(insert).not.toHaveBeenCalled();
    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(domainHasMx).not.toHaveBeenCalled();
  });

  it("blocks when the hourly rate limit is exceeded", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue("hourly");
    const res = await submitWaitlist({ ...base, email: "you@company.com" });
    expect(res.error).toBe(WAITLIST_MESSAGES.rateLimited);
    expect(insert).not.toHaveBeenCalled();
  });

  it("blocks during the per-minute cooldown", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue("cooldown");
    const res = await submitWaitlist({ ...base, email: "you@company.com" });
    expect(res.error).toBe(WAITLIST_MESSAGES.cooldown);
    expect(insert).not.toHaveBeenCalled();
  });
});
