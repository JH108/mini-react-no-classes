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
  performUnitOfWork(fiber) {
    // add fiber to the dom
    if (!fiber.dom) {
      fiber.dom = this.createDom(fiber);
    }

    if (fiber.parent) {
      fiber.parent.dom.appendChild(fiber.dom);
    }
    // build fibers for children
    const elements = fiber.props.children;
    let index = 0;
    let prevSibling = null;

    while (index < elements.length) {
      const element = elements[index];

      const newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: fiber
      };

      if (index === 0) {
        fiber.child = newFiber;
      } else {
        prevSibling.sibling = newFiber;
      }

      prevSibling = newFiber;
      index += 1;
    }
    // select next unit of work
    // if has child then child is next
    if (fiber.child) {
      return fiber.child;
    }
    let nextFiber = fiber;

    while (nextFiber) {
      // else if sibling then sibling is next
      if (nextFiber.sibling) {
        return nextFiber.sibling;
      }
      // else go back up the tree to find the sibling of the parent "uncle"
      nextFiber = nextFiber.parent;
    }
  }
  // Fibers
  createDom(fiber) {
    const dom =
      fiber.type === "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(fiber.type);
    const isProperty = key => key !== "children";

    Object.keys(fiber.props)
      .filter(isProperty)
      .forEach(name => {
        dom[name] = fiber.props[name];
      });

    return dom;
  }
  // The render Function
  render(element, container) {
    // Set next unit of work
    this.nextUnitOfWork = {
      dom: container,
      props: {
        children: [element]
      }
    };
  }
  // Render and Commit Phases
  // Reconciliation
  // Function Components
  // Hooks
}

export default new MyLibrary();
