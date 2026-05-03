import { describe, expect, it } from "vitest";

import { diffLayout } from "../src/router";

describe("diffLayout", () => {
  it("returns -1 when layouts are identical", () => {
    expect(diffLayout(["root", "posts"], ["root", "posts"])).toBe(-1);
  });

  it("returns the first differing index", () => {
    expect(diffLayout(["root", "posts"], ["root", "users"])).toBe(1);
  });

  it("returns the extra index when one layout is longer", () => {
    expect(diffLayout(["root"], ["root", "posts"])).toBe(1);
  });
});
