type Subscriber<T> = (value: T) => void;

export default function createObserver<T>(initialValue: T) {
  let value = initialValue;
  const subscribers: Array<Subscriber<T>> = [];

  function notify() {
    for (const subscriber of subscribers) {
      subscriber(value);
    }
  }

  return {
    get: () => value,
    subscribe: (fn: Subscriber<T>) => {
      subscribers.push(fn);
    },
    set: (newValue: T) => {
      if (value !== newValue) {
        value = structuredClone(newValue);
        notify();
      }
    },
    update: (updateFn: (currentValue: T) => T) => {
      const newValue = updateFn(value);
      if (value !== newValue) {
        value = structuredClone(newValue);
        notify();
      }
    },
  };
}
