import { createState, createComputedState } from "./core/observer";

const [val, setval, subval] = createState(0);
const [_, subValC] = createComputedState(() => val() * 2);
const cEl = document.getElementById("count");
const sCel = document.getElementById("scount");
const iEl = document.getElementById("increment");
const dEl = document.getElementById("decrement");
const diEl = document.getElementById("dincrement");

function increment() {
  setval(val() + 1);
}

function doubleIncrement(value: any, setVal: any) {
  setVal(value() + 2);
}

function decrement() {
  setval(val() - 1);
}

iEl?.addEventListener("click", increment);
diEl?.addEventListener("click", () => doubleIncrement(val, setval));
dEl?.addEventListener("click", decrement);

function render(v: any) {
  cEl!.innerText = v;
}

function renderData(v: any) {
  sCel!.innerText = v;
}

subval(render);
subValC(renderData);
