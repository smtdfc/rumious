import { describe, it, expect, vi, beforeEach } from "vitest";
import { createState, State } from "../dist/index.js";
import { Effect } from "../dist/index.js";
import { scheduleEffect } from "../dist/index.js";

describe("Rumious Reactivity System", () => {
  describe("State", () => {
    it("should hold initial value", () => {
      const state = createState(10);
      expect(state.get()).toBe(10);
    });

    it("should update value and notify subscribers", () => {
      const state = createState("old");
      const spy = vi.fn();
      state.subscribe(spy);

      state.set("new");
      expect(state.get()).toBe("new");
      expect(spy).toHaveBeenCalledWith("new");
    });

    it("should not notify if value is the same (Object.is check)", () => {
      const obj = { a: 1 };
      const state = createState(obj);
      const spy = vi.fn();
      state.subscribe(spy);

      state.set(obj); // Same reference
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("Scheduler", () => {
    it("should batch multiple effect runs into one microtask", async () => {
      const runSpy = vi.fn();
      const mockEffect = { run: runSpy } as any;

      scheduleEffect(mockEffect);
      scheduleEffect(mockEffect);
      scheduleEffect(mockEffect);

      expect(runSpy).not.toHaveBeenCalled(); // Should be pending

      // Wait for microtask queue
      await Promise.resolve();

      expect(runSpy).toHaveBeenCalledTimes(1); // Batched!
    });
  });

  describe("Effect", () => {
    it("should run immediately upon creation", () => {
      const spy = vi.fn();
      new Effect(spy, []);
      expect(spy).toHaveBeenCalled();
    });

    it("should react to State changes via subscription", async () => {
      const count = createState(0);
      const spy = vi.fn();

      new Effect(() => {
        spy(count.get());
      }, [count]);

      expect(spy).toHaveBeenCalledWith(0);

      count.set(1);
      count.set(2);

      await Promise.resolve(); // Wait for scheduler
      expect(spy).toHaveBeenCalledTimes(2); // Initial (0) + Batched (2)
      expect(spy).toHaveBeenLastCalledWith(2);
    });

    it("should call cleanup function before re-running", async () => {
      const state = createState(0);
      const cleanup = vi.fn();

      new Effect(() => {
        state.get();
        return cleanup;
      }, [state]);

      expect(cleanup).not.toHaveBeenCalled();

      state.set(1);
      await Promise.resolve();

      expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it("should throw error if dependency is undefined", () => {
      expect(() => {
        new Effect(() => {}, [undefined]);
      }).toThrow("Effect dependencies cannot contain undefined values.");
    });
  });
});
