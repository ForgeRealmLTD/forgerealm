import { describe, expect, it } from "vitest";
import {
  fitWithin,
  formatBytes,
  isValidEmail,
  validateImageFile,
} from "../src/utils/lithophaneImage";

describe("fitWithin", () => {
  it("scales the long edge of a landscape photo to 2000px", () => {
    expect(fitWithin(4032, 3024)).toEqual({ width: 2000, height: 1500 });
  });

  it("scales the long edge of a portrait photo to 2000px", () => {
    expect(fitWithin(3024, 4032)).toEqual({ width: 1500, height: 2000 });
  });

  it("never upscales a small photo", () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });
});

describe("formatBytes", () => {
  it("formats the before/after sizes shown under the preview", () => {
    expect(formatBytes(4.2 * 1024 * 1024)).toBe("4.2 MB");
    expect(formatBytes(680 * 1024)).toBe("680 KB");
    expect(formatBytes(512)).toBe("512 B");
  });
});

describe("validateImageFile", () => {
  it("accepts an ordinary photo", () => {
    expect(
      validateImageFile({ type: "image/jpeg", size: 3_000_000 }),
    ).toBeNull();
  });

  it("lets an untyped file through to the decoder (HEIC on some phones)", () => {
    expect(validateImageFile({ type: "", size: 3_000_000 })).toBeNull();
  });

  it("rejects non-images", () => {
    expect(validateImageFile({ type: "application/pdf", size: 1000 })).toMatch(
      /isn't an image/,
    );
  });

  it("rejects anything over 25MB before compression", () => {
    expect(
      validateImageFile({ type: "image/jpeg", size: 26 * 1024 * 1024 }),
    ).toMatch(/under 25 MB/);
  });
});

describe("isValidEmail", () => {
  it("accepts a normal address and rejects junk", () => {
    expect(isValidEmail("someone@example.co.uk")).toBe(true);
    expect(isValidEmail("someone@")).toBe(false);
    expect(isValidEmail("no spaces@example.com")).toBe(false);
  });
});
