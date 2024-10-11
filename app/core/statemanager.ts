/**
 * Represents a subscriber function that listens for state changes.
 *
 * @template T - The type of the state.
 * @param {T} value - The current value of the state when the subscriber is notified.
 */
type Subscriber<T> = (value: T) => void;

/**
 * Getter function to retrieve the current value of the state.
 *
 * @template T - The type of the state.
 * @returns {T} - The current value of the state.
 */
type Getter<T> = () => T;

/**
 * Setter function to update the value of the state.
 *
 * @template T - The type of the state.
 * @param {T} newValue - The new value to set for the state.
 */
type Setter<T> = (newValue: T) => void;

/**
 * Represents a function to subscribe to state changes.
 *
 * @template T - The type of the state.
 * @param {Subscriber<T>} fn - A function to call whenever the state changes.
 * @returns {() => void} - A function to unsubscribe from state changes.
 */
type SubscriberFn<T> = (fn: Subscriber<T>) => () => void;

/**
 * Base interface for representing a state with getter, setter, and subscription capabilities.
 *
 * @template T - The type of the state.
 */
interface State<T> {
  get: Getter<T>;
  set: Setter<T>;
  subscribe: SubscriberFn<T>;

  /**
   * Adds a dependency to the state.
   * @param {InternalState<T> | InternalComputedState<T>} dependency - The dependent state to add.
   */
  addDependency(dependency: InternalState<T> | InternalComputedState<T>): void;

  /**
   * Removes a dependency from the state.
   * @param {InternalState<T> | InternalComputedState<T>} dependency - The dependent state to remove.
   */
  removeDependency(
    dependency: InternalState<T> | InternalComputedState<T>
  ): void;
}

/**
 * Interface for representing a computed state, which can recompute its value.
 *
 * @template T - The type of the state.
 */
interface ComputedState<T> extends State<T> {
  recompute(): void;
}

/**
 * Interface for representing a hybrid state, combining computed and manual states.
 *
 * @template T - The type of the state.
 */
interface HybridState<T> extends State<T> {
  recompute(): void;
  set: Setter<Partial<T>>;
}

/**
 * Internal interface for representing a state with subscribers and dependents.
 *
 * @template T - The type of the state.
 */
interface InternalState<T> extends State<T> {
  subscribers: Set<Subscriber<T>>;
  dependents: Set<InternalState<T> | InternalComputedState<T>>;
}

/**
 * Internal interface for representing a computed state with subscribers and dependents.
 *
 * @template T - The type of the computed state.
 */
interface InternalComputedState<T> extends ComputedState<T> {
  subscribers: Set<Subscriber<T>>;
  dependents: Set<InternalState<T> | InternalComputedState<T>>;
}

/**
 * Internal interface for representing a hybrid state with subscribers and dependents.
 *
 * @template T - The type of the hybrid state.
 */
interface InternalHybridState<T> extends HybridState<T> {
  subscribers: Set<Subscriber<T>>;
  dependents: Set<InternalState<T> | InternalComputedState<T>>;
}

let currentlyComputing: InternalComputedState<any> | null = null;

const pendingStates = new Set<State<any>>();
let isProcessingPending = false;

/**
 * Compares two arrays of dependencies to check if they are equal.
 *
 * @template T - The type of the state dependencies.
 * @param {Array<InternalState<T> | InternalComputedState<T>>} prevDeps - The previous dependencies.
 * @param {Array<InternalState<T> | InternalComputedState<T>>} nextDeps - The next dependencies.
 * @returns {boolean} - Returns true if the dependencies are equal, otherwise false.
 */
function isEqual<T>(
  prevDeps: (InternalState<T> | InternalComputedState<T>)[],
  nextDeps: (InternalState<T> | InternalComputedState<T>)[]
): boolean {
  if (prevDeps.length !== nextDeps.length) return false;
  for (let i = 0; i < prevDeps.length; i++) {
    if (prevDeps[i] !== nextDeps[i]) return false;
  }
  return true;
}

/**
 * Schedules the processing of pending states.
 */
function scheduleProcessing(): void {
  if (!isProcessingPending) {
    isProcessingPending = true;
    Promise.resolve().then(processPendingStates);
  }
}

/**
 * Processes all pending states by recomputing their values and notifying subscribers.
 */
function processPendingStates(): void {
  isProcessingPending = false;
  const processedStates = new Set<State<any>>();

  while (pendingStates.size > 0) {
    const statesToProcess = new Set(pendingStates);
    pendingStates.clear();

    for (const state of statesToProcess) {
      if (processedStates.has(state)) {
        continue;
      }
      if ("recompute" in state) {
        processedStates.add(state);
        (state as InternalComputedState<any>).recompute();
        const value = state.get();
        const internalState = state as InternalComputedState<any>;
        for (const subscriber of internalState.subscribers) {
          subscriber(value);
        }
      }
    }

    for (const state of statesToProcess) {
      if (processedStates.has(state)) {
        continue;
      }
      if (!("recompute" in state)) {
        processedStates.add(state);
        const internalState = state as InternalState<any>;
        const value = state.get();
        for (const subscriber of internalState.subscribers) {
          subscriber(value);
        }
      }
    }

    // For all processed states, add their dependents to pendingStates
    for (const state of processedStates) {
      const internalState = state as InternalState<any>;
      for (const dependent of internalState.dependents) {
        if (!processedStates.has(dependent)) {
          pendingStates.add(dependent);
        }
      }
    }
  }
}

/**
 * Disposes of a state by clearing its subscribers and removing its dependencies.
 *
 * @template T - The type of the state.
 * @param {Set<Subscriber<T>>} subscribers - The subscribers to clear.
 * @param {Set<InternalState<any> | InternalComputedState<any>>} dependents - The dependents to remove.
 * @param {InternalState<T> | InternalComputedState<T>} state - The state to dispose of.
 */
function dispose<T>(
  subscribers: Set<Subscriber<T>>,
  dependents: Set<InternalState<any> | InternalComputedState<any>>,
  state: InternalState<T> | InternalComputedState<T>
): void {
  subscribers.clear();
  for (const dependent of dependents) {
    dependent.removeDependency(state);
  }
  dependents.clear();
}

/**
 * Adds a dependent state to the list of dependents.
 *
 * @param {Set<InternalState<any> | InternalComputedState<any>>} dependents - The set of dependents.
 * @param {InternalState<any> | InternalComputedState<any>} dependent - The dependent state to add.
 */
function addDependent(
  dependents: Set<InternalState<any> | InternalComputedState<any>>,
  dependent: InternalState<any> | InternalComputedState<any>
): void {
  dependents.add(dependent);
}

/**
 * Removes a dependent state from the list of dependents.
 *
 * @param {Set<InternalState<any> | InternalComputedState<any>>} dependents - The set of dependents.
 * @param {InternalState<any> | InternalComputedState<any>} dependent - The dependent state to remove.
 */
function removeDependent(
  dependents: Set<InternalState<any> | InternalComputedState<any>>,
  dependent: InternalState<any> | InternalComputedState<any>
): void {
  dependents.delete(dependent);
}

/**
 * Creates a simple state with getter, setter, and subscription capabilities.
 *
 * @template T - The type of the state.
 * @param {T} initialValue - The initial value of the state.
 * @returns {[Getter<T>, Setter<T>, SubscriberFn<T>]} - A tuple containing:
 *   - A getter function to retrieve the current state.
 *   - A setter function to update the state.
 *   - A subscriber function to listen for state changes.
 *
 * @example
 * ```typescript
 * const [getState, setState, subscribe] = createState(0);
 * subscribe(value => console.log(value));
 * setState(1);
 * console.log(getState()); // Outputs: 1
 * ```
 */
export function createState<T>(
  initialValue: T
): [Getter<T>, Setter<T>, SubscriberFn<T>] {
  let _value = structuredClone(initialValue);
  const subscribers = new Set<Subscriber<T>>();
  const dependents = new Set<InternalState<T> | InternalComputedState<T>>();

  const state: InternalState<T> = {
    get(): T {
      if (currentlyComputing) {
        currentlyComputing.addDependency(state);
        addDependent(dependents, currentlyComputing);
      }
      return _value;
    },
    set(newValue: T): void {
      if (_value !== newValue) {
        _value = structuredClone(newValue);
        pendingStates.add(state);
        scheduleProcessing();
      }
    },
    subscribe(fn: Subscriber<T>): () => void {
      subscribers.add(fn);
      fn(_value);
      return () => {
        subscribers.delete(fn);
        if (subscribers.size === 0 && dependents.size === 0) {
          dispose(subscribers, dependents, state);
        }
      };
    },
    subscribers,
    dependents,
    addDependency(dep: InternalState<T> | InternalComputedState<T>): void {
      dependents.add(dep);
    },
    removeDependency(dep: InternalState<T> | InternalComputedState<T>): void {
      dependents.delete(dep);
    },
  };

  return [state.get, state.set, state.subscribe];
}

/**
 * Creates a computed state, which derives its value from a function.
 *
 * @template T - The type of the state.
 * @param {() => T} computeFn - A function that computes the value of the state.
 * @returns {[Getter<T>, SubscriberFn<T>]} - A tuple containing:
 *   - A getter function to retrieve the computed state.
 *   - A subscriber function to listen for state changes.
 *
 * @example
 * ```typescript
 * const [getComputedState, subscribe] = createComputedState(() => 42);
 * subscribe(value => console.log(value)); // Outputs: 42
 * ```
 */
export function createComputedState<T>(
  computeFn: () => T
): [Getter<T>, SubscriberFn<T>] {
  let _value: T;
  const subscribers = new Set<Subscriber<T>>();
  const dependencies = new Set<InternalState<T> | InternalComputedState<T>>();
  const dependents = new Set<InternalState<T> | InternalComputedState<T>>();
  let lastDeps: (InternalState<T> | InternalComputedState<T>)[] = [];
  const computedState: InternalComputedState<T> = {
    get(): T {
      if (currentlyComputing && currentlyComputing !== computedState) {
        currentlyComputing.addDependency(computedState);
        addDependent(dependents, currentlyComputing);
      }
      return _value;
    },
    set(_: T): void {
      throw new Error("Cannot set value of a computed state");
    },
    subscribe(fn: Subscriber<T>): () => void {
      subscribers.add(fn);
      fn(_value);
      return () => {
        subscribers.delete(fn);
        if (
          subscribers.size === 0 &&
          dependencies.size === 0 &&
          dependents.size === 0
        ) {
          dispose(subscribers, dependents, computedState);
        }
      };
    },
    recompute(): void {
      for (const dep of dependencies) {
        removeDependent(dep.dependents, computedState);
      }

      dependencies.clear();

      const prevComputing = currentlyComputing;
      currentlyComputing = computedState;

      const newValue = computeFn();
      const nextDeps = Array.from(dependencies);
      if (!isEqual(lastDeps, nextDeps)) {
        _value = structuredClone(newValue);
        lastDeps = nextDeps;
      }
      currentlyComputing = prevComputing;

      if (_value !== newValue) {
        _value = structuredClone(newValue);
        pendingStates.add(computedState);
        scheduleProcessing();
      }
    },
    addDependency(dep: InternalState<T> | InternalComputedState<T>): void {
      dependencies.add(dep);
    },
    removeDependency(dep: InternalState<T> | InternalComputedState<T>): void {
      dependencies.delete(dep);
    },
    subscribers,
    dependents,
  };

  // Initialize the value
  computedState.recompute();

  return [computedState.get, computedState.subscribe];
}

/**
 * Creates a hybrid state that combines computed and manual state management.
 *
 * @template T - The type of the state object.
 * @param {() => T} computeFn - A function that computes the initial state.
 * @param {T} initialValue - The initial value of the state.
 * @returns {[Getter<T>, Setter<Partial<T>>, SubscriberFn<T>]} - A tuple containing:
 *   - A getter function to retrieve the current state.
 *   - A setter function to update the state with partial values.
 *   - A subscriber function to listen for state changes.
 *
 * @example
 * ```typescript
 * const [getState, setState, subscribe] = createHybridState(
 *   () => ({ count: 0 }),
 *   { count: 0 }
 * );
 *
 * subscribe((state) => {
 *   console.log(state.count);
 * });
 *
 * setState({ count: 1 });
 * console.log(getState().count); // Outputs: 1
 * ```
 */
export function createHybridState<T extends object>(
  computeFn: () => T,
  initialValue: T
): [Getter<T>, Setter<Partial<T>>, SubscriberFn<T>] {
  let _value = structuredClone(initialValue);
  const subscribers = new Set<Subscriber<T>>();
  const dependencies = new Set<InternalState<T> | InternalComputedState<T>>();
  const dependents = new Set<InternalState<T> | InternalComputedState<T>>();
  let lastDeps: (InternalState<T> | InternalComputedState<T>)[] = [];
  let manualOverride: Partial<T> | null = null;

  const hybridState: InternalHybridState<T> = {
    get(): T {
      if (currentlyComputing && currentlyComputing !== hybridState) {
        currentlyComputing.addDependency(hybridState);
        addDependent(dependents, currentlyComputing);
      }
      return _value;
    },
    set(newPartialValue: Partial<T>): void {
      manualOverride = { ...manualOverride, ...newPartialValue };
      _value = {
        ...structuredClone(_value),
        ...manualOverride,
      };

      pendingStates.add(hybridState);
      scheduleProcessing();
    },
    subscribe(fn: Subscriber<T>): () => void {
      subscribers.add(fn);
      fn(_value);
      return () => {
        subscribers.delete(fn);
        if (
          subscribers.size === 0 &&
          dependencies.size === 0 &&
          dependents.size === 0
        ) {
          dispose(subscribers, dependents, hybridState);
        }
      };
    },
    recompute(): void {
      for (const dep of dependencies) {
        removeDependent(dep.dependents, hybridState);
      }

      dependencies.clear();

      const prevComputing = currentlyComputing;
      currentlyComputing = hybridState;

      const newValue = computeFn();
      const nextDeps = Array.from(dependencies);

      if (!isEqual(lastDeps, nextDeps)) {
        lastDeps = nextDeps;
      }

      currentlyComputing = prevComputing;

      if (manualOverride) {
        _value = {
          ...structuredClone(newValue),
          ...manualOverride,
        };
      } else {
        _value = structuredClone(newValue);
      }

      pendingStates.add(hybridState);
      scheduleProcessing();
    },
    addDependency(dep: InternalState<T> | InternalComputedState<T>): void {
      dependencies.add(dep);
    },
    removeDependency(dep: InternalState<T> | InternalComputedState<T>): void {
      dependencies.delete(dep);
    },
    subscribers,
    dependents,
  };

  // Initialize the value
  hybridState.recompute();

  return [
    hybridState.get,
    hybridState.set as Setter<Partial<T>>,
    hybridState.subscribe,
  ];
}
