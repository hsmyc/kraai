import { StateManager } from "./core/statemanager";

const cstate = { id: 0, value: 0 };
const mstate = { id: 1, value: "Osman" };
const manager = new StateManager([cstate, mstate]);

function increment() {
  const { id, value } = manager.getState(cstate.id);
  manager.setState({ id, value: value + 1 }, () =>
    renderElement(cEl as HTMLElement, id)
  );
}

function decrement() {
  const { id, value } = manager.getState(cstate.id);
  manager.setState({ id: id, value: value - 1 }, () =>
    renderElement(cEl as HTMLElement, id)
  );
}

const iEl = document.getElementById("increment");
const dEl = document.getElementById("decrement");
const cEl = document.getElementById("count");
const mEl = document.getElementById("message");
const inputEl = document.getElementById("input");

iEl?.addEventListener("click", increment);
dEl?.addEventListener("click", decrement);
inputEl?.addEventListener("input", (e) => {
  const val = (e.target as HTMLInputElement).value;
  const { id } = manager.getState(mstate.id);
  manager.setState({ id, value: val }, () =>
    renderElement(mEl as HTMLElement, id)
  );
});
function renderElement(element: HTMLElement, stateId: number) {
  element.innerText = manager.getState(stateId).value.toString();
}

function render() {
  renderElement(cEl!, cstate.id);
  renderElement(mEl!, mstate.id);
}

render();
