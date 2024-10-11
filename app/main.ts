import {
  createState,
  createComputedState,
  createHybridState,
} from "./core/statemanager";

// States
const [val, setval, subval] = createState(0);
const [_, subValC] = createComputedState(() => val() * 2);
const [t, setT, subT] = createState(0);
const [_2, setObj, subObj] = createHybridState(
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
const [_3, setData, subData] = createState({});

// DOM Elements
const cEl = document.getElementById("count");
const sCel = document.getElementById("scount");
const dCel = document.getElementById("dcount");
const iEl = document.getElementById("increment");
const dEl = document.getElementById("decrement");
const diEl = document.getElementById("name");
const tEL = document.getElementById("timer");
const dataEl = document.getElementById("data");
const dataEl2 = document.getElementById("data2");

// Event Handlers
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

function timer() {
  setT(t() + 1);
}

function getData() {
  fetch("https://randomuser.me/api/")
    .then((res) => res.json())
    .then((data) => {
      console.log(data.results[0]);
      setData(data.results[0]);
    });
}

// Event Listeners
iEl?.addEventListener("click", increment);
diEl?.addEventListener("click", () => {
  setObject();
});
dEl?.addEventListener("click", decrement);
dataEl?.addEventListener("click", getData);
setInterval(timer, 1000);

// Renderers
function render(v: any) {
  cEl!.innerText = v;
}

function renderData(v: any) {
  sCel!.innerText = v;
}

function renderData2(v: any) {
  dCel!.innerText = `${v.no} ${v.name.first} ${v.name.last}`;
}

function renderTimer(v: any) {
  tEL!.innerText = v;
}

function renderData3(v: any) {
  dataEl2!.innerText = JSON.stringify(v);
}

// Subscribers
subval(render);
subValC(renderData);
subObj(renderData2);
subT(renderTimer);
subData(renderData3);
