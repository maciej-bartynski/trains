const appendChild = (parent: Element, child: Element) => {
    if (!child.isConnected) {
        parent.appendChild(child);
    }
}

const insertBefore = (parent: Element, child: Element, anchor: Element) => {
    if (!child.isConnected) {
        parent.insertBefore(child, anchor);
    }
}

const elementHelpers = {
    appendChild,
    insertBefore,
}

export default elementHelpers;