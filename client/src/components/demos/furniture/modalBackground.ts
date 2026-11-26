const active = new WeakMap<Element, { count: number; wasInert: boolean }>();

/** Shared by furniture portals that can hand focus to one another during a single navigation. */
export function lockBackground(nodes: Element[]) {
  const unique = Array.from(new Set(nodes));
  for (const node of unique) {
    const lock = active.get(node);
    if (lock) lock.count += 1;
    else {
      active.set(node, { count: 1, wasInert: node.hasAttribute('inert') });
      node.setAttribute('inert', '');
    }
  }
  return () => {
    for (const node of unique) {
      const lock = active.get(node);
      if (!lock || --lock.count > 0) continue;
      if (!lock.wasInert) node.removeAttribute('inert');
      active.delete(node);
    }
  };
}
