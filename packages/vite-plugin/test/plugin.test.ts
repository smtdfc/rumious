import { expect, test } from "vitest";
import rumiousPlugin from "../dist/index";
const plugin = rumiousPlugin() as any;

test("plugin name", () => {
  expect(plugin.name).toBe("vite-plugin-rumious");
});

test("transform TSX code", () => {
  const code = `
    const App = () => <div>Hello, world!</div>;
    export default App;
`;
  const result = plugin.transform(code, "App.tsx");
  expect(result).toHaveProperty("code");
  expect(result).toHaveProperty("map");
});

test("transform JSX code", () => {
  const code = `
    const App = () => <div>Hello, world!</div>;
    export default App;
    `;
  const result = plugin.transform(code, "App.jsx");
  expect(result).toHaveProperty("code");
  expect(result).toHaveProperty("map");
});

test("no transform for non-TSX/JSX files", () => {
  const code = `
    console.log('This is a regular JS file.');
    `;
  const result = plugin.transform(code, "script.js");
  expect(result).toBeUndefined();
});
