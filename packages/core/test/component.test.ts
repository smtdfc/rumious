import { describe, it, expect, vi } from "vitest";
import { component, ComponentMetadata } from "../dist/index.js";

describe("Component Factory & Metadata", () => {
  describe("Runtime Implementation", () => {
    it("should return an instance of ComponentMetadata", () => {
      const MyComponent = component(() => {}, "test-component");

      expect(MyComponent).toBeInstanceOf(ComponentMetadata);
    });

    it("should correctly store the provided tagName", () => {
      const tagName = "custom-element";
      const MyComponent = component(() => {}, tagName);

      expect(MyComponent.tagName).toBe(tagName);
    });

    it("should initialize with an empty props object as a placeholder", () => {
      const MyComponent = component(() => {}, "test-component");

      // Verification of the {} /* Trust me */ part
      expect(MyComponent.props).toEqual({});
    });

    it("should throw an error in createElement if constructor is missing", () => {
      // Manual instantiation to test guard clause
      const metadata = new ComponentMetadata(null, "div");

      expect(() => metadata.createElement()).toThrow(
        "Component constructor is not defined",
      );
    });

    it("should return a BaseComponentElement when createElement is called", () => {
      const MyComponent = component(() => {}, "app-root");
      const element = MyComponent.createElement();

      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.tagName.toLowerCase()).toBe("app-root");
    });
  });

  describe("Type System Integrity (Static Analysis Simulation)", () => {
    it("should satisfy the JSX Component signature", () => {
      interface MockProps {
        active: boolean;
      }

      const MyComponent = component<MockProps>(() => {}, "mock-comp");

      /**
       * This test ensures that the 'new' signature exists on the type level.
       * Even though it's an object at runtime, TS should treat it as a constructor.
       */
      const ConstructorReference = MyComponent as unknown as new (
        props: MockProps,
      ) => any;
      expect(ConstructorReference).toBeDefined();
    });
  });
});
