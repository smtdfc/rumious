import { expect, test, describe } from "bun:test";
import { compile } from "../dist/index.js";

describe("Compiler test", () => {
  test("should throw an error when code is not valid syntax ", () => {
    expect(() => {
      compile("<div>invalid code");
    }).toThrow();
  });

  test("should compile when code is valid", () => {
    const result = compile("const a = 1;", {
      filename: "index.ts",
    });

    expect(result.code).toEqual(expect.stringContaining("const a = 1;"));
    expect(result.map).toEqual(
      expect.objectContaining({
        sources: ["index.ts"],
        mappings: expect.any(String),
      }),
    );
  });

  test("should add @rumious/runtime into compiled code", () => {
    const result = compile("<div>This is div tag</div>", {
      filename: "index.ts",
    });

    expect(result.code).toEqual(expect.stringContaining("@rumious/runtime"));
  });

  test("should transform jsx into template", () => {
    const result = compile(`<div a="saa" b={a+1}>This is div tag</div>`, {
      filename: "index.ts",
    });

    expect(result.code).toEqual(expect.stringContaining("@rumious/runtime"));
    expect(result.code).toEqual(expect.stringContaining("$$template"));
  });

  test("should transform dynamic attributes", () => {
    const result = compile(
      `<div a="saa" b={a+1} a:b={a+1}>This is div tag <div c={2+1}>Hello {name}</div> 
      sdd
      do;d
      
      </div>`,
      {
        filename: "index.ts",
      },
    );

    console.log(result.code);

    expect(result.code).toEqual(expect.stringContaining("@rumious/runtime"));
    expect(result.code).toEqual(expect.stringContaining("$$template"));
    expect(result.code).toEqual(expect.stringContaining("$$walk"));
    expect(result.code).toEqual(expect.stringContaining(`setAttribute("b",`));
    expect(result.code).toEqual(expect.stringContaining(`setAttribute("a:b",`));
  });
});
