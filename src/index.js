import "./styles.css";

const app = document.getElementById("app");

const MyLibrary = {
  createTextElement(text) {
    return {
      type: "TEXT_ELEMENT",
      props: {
        nodeValue: text,
        children: []
      }
    };
  },
  // The createElement Function
  createElement(type, props, ...children) {
    return {
      type,
      props: {
        ...props,
        children: children.map(child =>
          typeof child === "object" ? child : this.createTextElement(child)
        )
      }
    };
  },
  // The render Function
  render(element, container) {
    const dom =
      element.type === "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(element.type);

    const isProperty = key => key !== "children";
    const addAttribute = name => {
      dom[name] = element.props[name];
    };

    Object.keys(element.props)
      .filter(isProperty)
      .forEach(addAttribute);

    element.props.children.forEach(child => {
      this.render(child, dom);
    });

    container.appendChild(dom);
  }
  // Concurrent Mode
  // Fibers
  // Render and Commit Phases
  // Reconciliation
  // Function Components
  // Hooks
};

/** @jsx MyLibrary.createElement */
const element = MyLibrary.createElement(
  "div",
  { id: "first", title: "Ha" },
  MyLibrary.createElement("a", null, "it worked!"),
  MyLibrary.createElement("b"),
  MyLibrary.createElement("h3", null, "First h3 with my library")
);

MyLibrary.render(element, app);
