import {
  createState,
  createComputedState,
  createHybridState,
} from "./statemanager";
import { expect, test, jest } from "bun:test";

test("createState should initialize state with the given value", () => {
  const [get] = createState(0);
  expect(get()).toBe(0);
});

test("createState should update the state when set is called", () => {
  const [get, set] = createState(0);
  set(5);
  expect(get()).toBe(5);
});

test("createState should call subscribers when state is updated", async () => {
  const [_, set, subscribe] = createState(0);
  const subscriber = jest.fn();
  subscribe(subscriber);
  set(10);
  await new Promise((resolve) => setImmediate(resolve));
  expect(subscriber).toHaveBeenCalledWith(10);
});

test("createState should stop calling subscriber after it unsubscribes", () => {
  const [_, set, subscribe] = createState(0);
  const subscriber = jest.fn();
  const unsubscribe = subscribe(subscriber);

  unsubscribe();
  set(20);
  expect(subscriber).toHaveBeenCalledTimes(1); // Only called once initially
});

test("createComputedState should initialize computed state with computed value", () => {
  const [getA, _] = createState(2);
  const [getB] = createComputedState(() => getA() * 2);

  expect(getB()).toBe(4);
});

test("createComputedState should recompute when dependencies change", async () => {
  const [getA, setA] = createState(3);
  const [_, subscribeB] = createComputedState(() => getA() + 5);

  const subscriber = jest.fn();
  subscribeB(subscriber);

  setA(7);

  await new Promise((resolve) => setImmediate(resolve));
  expect(subscriber).toHaveBeenCalledWith(12);
});

test("createComputedState should not recompute if dependencies do not change", () => {
  const [getA, setA] = createState(4);
  const [getB] = createComputedState(() => getA());

  const initialB = getB();
  setA(4); // setting the same value
  expect(getB()).toBe(initialB); // should still be 4
});

test("createHybridState should initialize hybrid state with computed and initial values", async () => {
  const [getA, _] = createState({ x: 5, y: 10 });
  const [getHybrid, _2] = createHybridState(() => getA(), {
    x: 10,
    y: 20,
  });
  console.log(getHybrid());
  await new Promise((resolve) => setImmediate(resolve));
  expect(getHybrid()).toEqual({ x: 5, y: 10 });
});

test("createHybridState should update hybrid state with partial values", () => {
  const [getHybrid, setHybrid] = createHybridState(() => ({ x: 1, y: 2 }), {
    x: 1,
    y: 2,
  });
  setHybrid({ y: 5 });

  expect(getHybrid()).toEqual({ x: 1, y: 5 });
});

test("createHybridState should recompute hybrid state when dependencies change", async () => {
  const [getA, setA] = createState({ x: 5, y: 0 });
  const [getHybrid, _] = createHybridState(() => getA(), {
    x: 5,
    y: 10,
  });

  setA({ x: 8, y: 10 });

  await new Promise((resolve) => setImmediate(resolve));
  expect(getHybrid()).toEqual({ x: 8, y: 10 });
});
