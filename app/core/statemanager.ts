type State = {
  id: number;
  value: any;
};

export class StateManager {
  private oldState: State[] = [];
  private newState: State[] = [];
  private cache: Map<string, State[]> = new Map();

  constructor(state: State[]) {
    this.oldState = [...state];
    this.newState = [...state];
    this.cache.set(JSON.stringify(state), state);
  }
  private refresher(id: number): boolean {
    const oldVal = this.oldState.find((s) => s.id === id)?.value;
    const newVal = this.newState.find((s) => s.id === id)?.value;
    return oldVal !== newVal;
  }
  public getState(id: number): State {
    return this.newState.find((s) => s.id === id)!;
  }

  public setState(newState: State, fn: () => void) {
    this.oldState = [...this.newState];
    const index = this.newState.findIndex((s) => s.id === newState.id);
    if (index !== -1) {
      this.newState[index] = { ...newState };
    }
    this.cache.set(JSON.stringify(this.oldState), [...this.newState]);
    if (this.refresher(newState.id)) fn();
  }

  public getCache(): Map<string, State[]> {
    return this.cache;
  }
}
