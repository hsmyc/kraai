import {
  createState,
  createComputedState,
  createHybridState,
} from "./core/statemanager";
const [val, setval, subval] = createState(0);
const [_, subValC] = createComputedState(() => val() * 2);

const [obj, setObj, subObj] = createHybridState(
  () => ({
    no: val(),
    name: {
      first: "John",
      last: "Doe",
    },
  }),
  {
    no: val(),
    name: {
      first: "John",
      last: "Doe",
    },
  }
);
const cEl = document.getElementById("count");
const sCel = document.getElementById("scount");
const dCel = document.getElementById("dcount");
const iEl = document.getElementById("increment");
const dEl = document.getElementById("decrement");
const diEl = document.getElementById("dincrement");

function increment() {
  setval(val() + 1);
}

function decrement() {
  setval(val() - 1);
}
function setObject() {
  setObj({
    name: {
      first: "Jane",
      last: "Doe",
    },
  });
}
iEl?.addEventListener("click", increment);
diEl?.addEventListener("click", () => {
  setObject();
});
dEl?.addEventListener("click", decrement);

function render(v: any) {
  cEl!.innerText = v;
}

function renderData(v: any) {
  sCel!.innerText = v;
}

function renderData2(v: any) {
  dCel!.innerText = `${v.no} ${v.name.first} ${v.name.last}`;
}

subval(render);
subValC(renderData);
subObj(renderData2);
