type Subscriber<T> = (value: T) => void;
type Getter<T> = () => T;
type Setter<T> = (newValue: T) => void;
type SubscriberFn<T> = (fn: Subscriber<T>) => () => void;

interface State<T> {
  get: Getter<T>;
  set: Setter<T>;
  subscribe: SubscriberFn<T>;
  addDependency(dependency: InternalState<T> | InternalComputedState<T>): void;
  removeDependency(
    dependency: InternalState<T> | InternalComputedState<T>
  ): void;
}

interface ComputedState<T> extends State<T> {
  recompute(): void;
}
interface HybridState<T> extends State<T> {
  recompute(): void;
  set: Setter<Partial<T>>;
}
interface InternalState<T> extends State<T> {
  subscribers: Set<Subscriber<T>>;
  dependents: Set<InternalState<T> | InternalComputedState<T>>;
}

interface InternalComputedState<T> extends ComputedState<T> {
  subscribers: Set<Subscriber<T>>;
  dependents: Set<InternalState<T> | InternalComputedState<T>>;
}
interface InternalHybridState<T> extends HybridState<T> {
  subscribers: Set<Subscriber<T>>;
  dependents: Set<InternalState<T> | InternalComputedState<T>>;
}
let currentlyComputing: InternalComputedState<any> | null = null;

const pendingStates = new Set<State<any>>();
let isProcessingPending = false;

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

function scheduleProcessing() {
  if (!isProcessingPending) {
    isProcessingPending = true;
    Promise.resolve().then(processPendingStates);
  }
}

function processPendingStates() {
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

function dispose<T>(
  subscribers: Set<Subscriber<T>>,
  dependents: Set<InternalState<any> | InternalComputedState<any>>,
  state: InternalState<T> | InternalComputedState<T>
) {
  subscribers.clear();
  for (const dependent of dependents) {
    dependent.removeDependency(state);
  }
  dependents.clear();
}

function addDependent(
  dependents: Set<InternalState<any> | InternalComputedState<any>>,
  dependent: InternalState<any> | InternalComputedState<any>
) {
  dependents.add(dependent);
}

function removeDependent(
  dependents: Set<InternalState<any> | InternalComputedState<any>>,
  dependent: InternalState<any> | InternalComputedState<any>
) {
  dependents.delete(dependent);
}

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
