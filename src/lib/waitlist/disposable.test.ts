import { describe, expect, it } from "vitest";

import { isDisposableDomain } from "./disposable";

describe("isDisposableDomain", () => {
  it("flags known disposable providers", () => {
    expect(isDisposableDomain("mailinator.com")).toBe(true);
    expect(isDisposableDomain("MAILINATOR.COM")).toBe(true);
  });

  it("flags supplemental temp-mail domains not in the package", () => {
    expect(isDisposableDomain("ezimb.com")).toBe(true);
    expect(isDisposableDomain("EZIMB.COM")).toBe(true);
  });

  it("allows real providers", () => {
    expect(isDisposableDomain("gmail.com")).toBe(false);
    expect(isDisposableDomain("company.com")).toBe(false);
  });

  it("handles empty input", () => {
    expect(isDisposableDomain("")).toBe(false);
  });
});
