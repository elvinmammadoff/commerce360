import { describe, expect, it } from "vitest";

import { getDomain, normalizeEmail } from "./normalize";

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  You@Company.COM ")).toBe("you@company.com");
  });
});

describe("getDomain", () => {
  it("returns the domain part", () => {
    expect(getDomain("you@company.com")).toBe("company.com");
  });

  it("returns empty string when malformed", () => {
    expect(getDomain("nodomain")).toBe("");
  });
});
