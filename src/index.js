// import R from "./library";
import { R } from "./functions";
// import "./styles.css";

// /** @jsx R.createElement */
// const element = R.createElement(
//   "div",
//   { id: "first", title: "Ha" },
//   R.createElement("a", null, "it worked!"),
//   R.createElement("b"),
//   R.createElement("h3", null, "First h3 with my library")
// );

// R.render(element, app);
console.log(R);
/** @jsx R.createElement */
// requestIdleCallback(R.workLoop);
const container = document.getElementById("root");
console.log("container", container);

const updateValue = e => {
  rerender(e.target.value);
};

function Counter() {
  const [state, setState] = R.useState(1);
  return <h1 onClick={() => setState(c => c + 1)}>Count: {state}</h1>;
}

const rerender = value => {
  const element = (
    <div>
      <input onInput={updateValue} value={value} />
      <h2>Hello {value}</h2>
      <App name="foo" />
      <Counter />
    </div>
  );
  console.log("container", container);
  R.render(element, container);
};

rerender("World");

function App(props) {
  return <h1>Hi {props.name}</h1>;
}
