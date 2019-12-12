class MyLibrary {
  constructor() {
    this.nextUnitOfWork = null;
    this.wipRoot = null;
    this.currentRoot = null;
    this.deletions = [];
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

  reconcileChildren(wipFiber, elements) {
    let index = 0;
    let prevSibling = null;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

    while (index < elements.length || oldFiber != null) {
      const element = elements[index];
      let newFiber = null;
      // Probably still need to do the iteration of both the array and linked list
      const sameType = oldFiber && element && element.type === oldFiber.type;
      // Consider using keys here as well to see if a child switched places in an array
      if (sameType) {
        // Update the node with new props
        newFiber = {
          type: oldFiber.type,
          props: element.props,
          dom: oldFiber.dom,
          parent: wipFiber,
          alternate: oldFiber,
          effectType: "UPDATE"
        };
      }

      if (element && !sameType) {
        // Add this node
        newFiber = {
          type: element.type,
          props: element.props,
          dom: null,
          parent: wipFiber,
          alternate: null,
          effectType: "PLACEMENT"
        };
      }

      if (oldFiber && !sameType) {
        // Remove this node
        oldFiber.effectType = "DELETION";
        this.deletions.push(oldFiber);
      }

      if (index === 0) {
        wipFiber.child = newFiber;
      } else {
        prevSibling.sibling = newFiber;
      }

      prevSibling = newFiber;
      index += 1;
    }
  }

  performUnitOfWork(fiber) {
    // add fiber to the dom
    if (!fiber.dom) {
      fiber.dom = this.createDom(fiber);
    }
    // build fibers for children
    const elements = fiber.props.children;
    this.reconcileChildren(fiber, elements);
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

  updateDom(dom, prevProps, nextProps) {
    // TODO move these to helpers
    const isEvent = key => key.startsWith("on");
    const isProperty = key => key !== "children" && !isEvent(key);
    const isNew = (prev, next) => key => prev[key] !== next[key];
    const isGone = (prev, next) => key => !(key in next);

    // Remove old or changed event listeners
    Object.keys(prevProps)
      .filter(isEvent)
      .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
      .forEach(name => {
        const eventType = name.toLowerCase().substring(2);
        dom.removeEventListener(eventType, prevProps[name]);
      });

    // Add the new event listeners
    Object.keys(nextProps)
      .filter(isEvent)
      .filter(isNew(prevProps, nextProps))
      .forEach(name => {
        const eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, nextProps[name]);
      });

    // Remove old or changed properties
    Object.keys(prevProps)
      .filter(isProperty)
      .filter(isGone(prevProps, nextProps))
      .forEach(name => {
        dom[name] = "";
      });

    // Set new or changed properties
    Object.keys(nextProps)
      .filter(isProperty)
      .filter(isNew(prevProps, nextProps))
      .forEach(name => {
        dom[name] = nextProps[name];
      });
  }

  commitRoot() {
    this.deletions.forEach(this.commitWork);
    this.commitWork(this.wipRoot.child);
    this.currentRoot = this.wipRoot;
    this.wipRoot = null;
  }

  commitWork(fiber) {
    if (!fiber) {
      return;
    }

    const domParent = fiber.parent.dom;
    if (fiber.effectType === "PLACEMENT" && fiber.dom != null) {
      domParent.appendChild(fiber.dom);
    } else if (fiber.effectType === "DELETION" && fiber.dom != null) {
      domParent.removeChild(fiber.dom);
    } else if (fiber.effectType === "UPDATE" && fiber.dom != null) {
      this.updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    }
    this.commitWork(fiber.child);
    this.commitWork(fiber.sibling);
  }
  // The render Function
  render(element, container) {
    // Set next unit of work
    this.wipRoot = {
      dom: container,
      props: {
        children: [element]
      },
      alternate: this.currentRoot
    };
    this.deletions = [];
    this.nextUnitOfWork = this.wipRoot;
  }
  // Render and Commit Phases
  // Reconciliation
  // Function Components
  // Hooks
}

export default new MyLibrary();
