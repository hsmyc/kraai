type Subscriber<T> = (value: T) => void;
type Getter<T> = () => T;
type Setter<T> = (newValue: T) => void;
type SubscriberFn<T> = (fn: Subscriber<T>) => () => void;

interface State<T> {
  get: Getter<T>;
  set: Setter<T>;
  subscribe: SubscriberFn<T>;
}

interface ComputedState<T> extends State<T> {
  recompute(): void;
}

let currentlyComputing: any = null;

function dispose<T>(
  subscribers: Set<Subscriber<T>>,
  dependents: Set<any>,
  state: State<T>
) {
  subscribers.clear();
  for (const dependent of dependents) {
    dependent.removeDependency(state);
  }
  dependents.clear();
}

function notify<T>(
  subscribers: Set<Subscriber<T>>,
  dependents: Set<any>,
  value: T
) {
  for (const subscriber of subscribers) {
    subscriber(value);
  }
  for (const dependent of dependents) {
    dependent.recompute();
  }
}

function addDependent(dependents: Set<any>, dependent: any) {
  dependents.add(dependent);
}

function removeDependent(dependents: Set<any>, dependent: any) {
  console.log(dependents, dependent);
  dependents.delete(dependent);
}

export function createState<T>(
  initialValue: T
): [Getter<T>, Setter<T>, SubscriberFn<T>] {
  let _value = structuredClone(initialValue);
  const subscribers = new Set<Subscriber<T>>();
  const dependents = new Set<any>();

  const state: State<T> = {
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
        notify(subscribers, dependents, _value);
      }
    },
    subscribe(fn: Subscriber<T>): () => void {
      subscribers.add(fn);
      fn(_value);
      return () => {
        subscribers.delete(fn);
        // Optionally dispose if no subscribers or dependents
        if (subscribers.size === 0 && dependents.size === 0) {
          dispose(subscribers, dependents, state);
        }
      };
    },
  };

  return [state.get, state.set, state.subscribe];
}

// Function to create a new computed state
export function createComputedState<T>(
  computeFn: () => T
): [Getter<T>, SubscriberFn<T>] {
  let _value: T;
  const subscribers = new Set<Subscriber<T>>();
  const dependencies = new Set<any>();
  const dependents = new Set<any>();

  const computedState: ComputedState<T> = {
    get(): T {
      // Track dependencies if within another computed state
      if (currentlyComputing && currentlyComputing !== computedState) {
        currentlyComputing.addDependency(computedState);
        addDependent(dependents, currentlyComputing);
      }
      return _value;
    },
    // Prevent external mutation
    set(_: T): void {
      throw new Error("Cannot set value of a computed state");
    },
    subscribe(fn: Subscriber<T>): () => void {
      subscribers.add(fn);
      // Immediately call the subscriber with the current value
      fn(_value);
      return () => {
        subscribers.delete(fn);
        // Optionally dispose if no subscribers or dependencies
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
      // Remove self from previous dependencies
      for (const dep of dependencies) {
        removeDependent(dependents, dep);
      }
      dependencies.clear();

      // Set the currently computing state
      const prevComputing = currentlyComputing;
      currentlyComputing = computedState;

      // Compute the new value
      const newValue = computeFn();

      // Restore previous computing state
      currentlyComputing = prevComputing;

      // Update the value and notify subscribers if changed
      if (_value !== newValue) {
        _value = structuredClone(newValue);
        notify(subscribers, dependents, _value);
      }
    },
  };

  // Initialize the value by computing it for the first time
  computedState.recompute();

  return [computedState.get, computedState.subscribe];
}
