import { describe, expect, it } from "vitest";

import { match } from "../src";

describe("match", () => {
  it("matches exact routes", () => {
    expect(match("/posts", "/posts")).toEqual({ params: {} });
  });

  it("extracts params from dynamic segments", () => {
    expect(match("/users/:id", "/users/42")).toEqual({
      params: { id: "42" },
    });
  });

  it("supports wildcard routes", () => {
    expect(match("/*", "/any/route/here")).toEqual({
      params: { "*": "any/route/here" },
    });
  });

  it("returns null on mismatch", () => {
    expect(match("/users/:id", "/posts/42")).toBeNull();
  });
});
