class MyLibrary {
  constructor() {
    this.nextUnitOfWork = null;
    requestIdleCallback(this.workLoop);
  }
  createTextElement(text) {
    return {
      type: "TEXT_ELEMENT",
      props: {
        nodeValue: text,
        children: []
      }
    };
  }
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
  }
  // Concurrent Mode
  workLoop(deadline) {
    let shouldYield = false;
    while (this.nextUnitOfWork && !shouldYield) {
      this.nextUnitOfWork = this.performUnitOfWork(this.nextUnitOfWork);
      shouldYield = deadline.timeRemaining() > 1;
    }
    requestIdleCallback(this.workLoop);
  }
  performUnitOfWork() {
    // TODO
  }
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
  // Fibers
  // Render and Commit Phases
  // Reconciliation
  // Function Components
  // Hooks
}

export default new MyLibrary();
