// TODO: There will be 3 or 4 way of state management. 1. Global state 2.Local state 3.Proxy state 4. State Machine

import { SObject } from "./types.js";

const Object = new SObject({
  id: "1",
  nodes: [
    {
      id: "1",
      name: "one",
      child: {
        id: "2",
        age: { id: 1, name: "osman" },
        child: {
          id: "3",
          name: "three",
        },
      },
    },
  ],
});

console.log(Object.getAllValues());
