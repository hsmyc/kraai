export type Node<V = string> = {
  id: string | number;
} & {
  [K in Exclude<string, "id">]?: V | Node<V>;
};

export type Store<V = string> = {
  id: string;
  nodes: Node<V>[];
};

export class SObject<V = string> {
  private store: Store<V>;

  constructor(store: Store<V>) {
    this.store = store;
  }
  public getValuesFromNode(node: Node<V>): V[] {
    const values: V[] = [];
    for (const key in node) {
      if (key !== "id" && node.hasOwnProperty(key)) {
        const value = node[key];
        if (typeof value === "object" && value !== null && "id" in value) {
          values.push(...this.getValuesFromNode(value as Node<V>));
        } else {
          values.push(value as V);
        }
      }
    }

    return values;
  }

  // Method to get values from all nodes in the store
  public getAllValues(): V[] {
    return this.store.nodes.flatMap((node) => this.getValuesFromNode(node));
  }

  // Additional method to add a node to the store
  public addNode(node: Node<V>) {
    this.store.nodes.push(node);
  }

  // Method to get the store
  public getStore(): Store<V> {
    return this.store;
  }
}
