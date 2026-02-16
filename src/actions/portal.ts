export function portal(node: HTMLElement, target: HTMLElement | string = 'body') {
    let targetEl: Element | null;

    function update(t: HTMLElement | string) {
        targetEl = typeof t === 'string' ? document.querySelector(t) : t;
        if (targetEl) {
            targetEl.appendChild(node);
        }
    }

    update(target);

    return {
        update,
        destroy() {
            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }
        }
    };
}
