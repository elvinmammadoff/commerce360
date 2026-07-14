import { describe, expect, it } from "vitest";

import { isValidEmailSyntax } from "./syntax";

describe("isValidEmailSyntax", () => {
  it("accepts well-formed addresses", () => {
    expect(isValidEmailSyntax("you@company.com")).toBe(true);
    expect(isValidEmailSyntax("a.b+tag@sub.example.co.uk")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    expect(isValidEmailSyntax("notanemail")).toBe(false);
    expect(isValidEmailSyntax("missing@domain")).toBe(false);
    expect(isValidEmailSyntax("@nolocal.com")).toBe(false);
    expect(isValidEmailSyntax("has space@x.com")).toBe(false);
    expect(isValidEmailSyntax("")).toBe(false);
  });

  it("rejects addresses over 254 chars", () => {
    const long = `${"a".repeat(250)}@x.com`;
    expect(isValidEmailSyntax(long)).toBe(false);
  });
});
