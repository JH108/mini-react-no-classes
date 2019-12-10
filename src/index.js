import R from "../lib";
import "./styles.css";

const app = document.getElementById("app");

/** @jsx R.createElement */
const element = R.createElement(
  "div",
  { id: "first", title: "Ha" },
  R.createElement("a", null, "it worked!"),
  R.createElement("b"),
  R.createElement("h3", null, "First h3 with my library")
);

R.render(element, app);
