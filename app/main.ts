import O from "./core/observer";

const value = O(0);

const cEl = document.getElementById("count");
const iEl = document.getElementById("increment");
const dEl = document.getElementById("decrement");
const dataEl = document.getElementById("data");

function increment() {
  value.set(value.get() + 1);
}

function decrement() {
  value.set(value.get() - 1);
}
async function getResource() {
  fetch("https://jsonplaceholder.typicode.com/posts/1")
    .then((response) => response.json())
    .then((data) => {
      value.set(data.body);
    });
}
iEl?.addEventListener("click", increment);
dEl?.addEventListener("click", decrement);
dataEl?.addEventListener("click", getResource);

function render(v: any) {
  cEl!.innerText = v;
}

function renderData(v: any) {
  dataEl!.innerText = v;
}

value.subscribe(render);
value.subscribe(renderData);
