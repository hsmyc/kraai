# State Management Library

## Overview

This project provides a flexible and efficient state management system for handling different types of states: regular, computed, and hybrid states. It is designed for simplicity, performance, and extensibility, making it suitable for various applications where state handling and dependency management are crucial.

## Features

- **State Management**: Create, manage, and subscribe to state changes with a simple API.
- **Computed State**: Automatically compute derived state values based on dependencies.
- **Hybrid State**: Combine computed and manual state management for advanced use cases.
- **Dependency Tracking**: Efficiently track dependencies between states, ensuring accurate and minimal updates.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/hsmyc/kraai.git
   cd project-name
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

## Usage

### Running the Project

To run the app locally, use:

```bash
bun run dev
```

### Creating a State

You can create a state using the `createState` function:

```typescript
const [getState, setState, subscribe] = createState(0);

subscribe((value) => {
  console.log("State updated:", value);
});

setState(1);
console.log(getState()); // Outputs: 1
```

### Creating a Computed State

Computed states automatically derive their value from other states:

```typescript
const [getCount, setCount] = createState(0);

const [getDoubleCount, subscribeDoubleCount] = createComputedState(
  () => getCount() * 2
);

subscribeDoubleCount((value) => {
  console.log("Double count:", value);
});

setCount(2); // Outputs: Double count: 4
```

### Creating a Hybrid State

Hybrid states allow both manual updates and computed values:

```typescript
const [getHybrid, setHybrid, subscribeHybrid] = createHybridState(
  () => ({ count: 0 }),
  { count: 0 }
);

subscribeHybrid((state) => {
  console.log("Hybrid state:", state);
});

setHybrid({ count: 5 });
console.log(getHybrid().count); // Outputs: 5
```

## Testing

To run the tests for the state manager, use:

```bash
bun test
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
