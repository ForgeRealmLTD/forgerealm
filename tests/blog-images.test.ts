import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const BLOG_DIR = path.resolve("public", "blog");
const SIZED_DIR = path.join(BLOG_DIR, "sized");
const STALLS = path.resolve("src", "data", "stalls.ts");

describe("blog timeline images", () => {
  const timelineSrcs = [
    ...fs.readFileSync(STALLS, "utf8").matchAll(/src: "(\/blog\/[^"]+)"/g),
  ].map((m) => m[1]);

  it("finds the timeline's images", () => {
    expect(timelineSrcs.length).toBeGreaterThan(0);
  });

  it.each(timelineSrcs)("%s has its original and resized copies", (src) => {
    expect(fs.existsSync(path.join("public", src))).toBe(true);
    const name = path.parse(src).name;
    for (const width of [640, 1280]) {
      // Missing? Run `npm run images:blog` and commit public/blog/sized.
      expect(fs.existsSync(path.join(SIZED_DIR, `${name}-${width}.webp`))).toBe(
        true,
      );
    }
  });
});
