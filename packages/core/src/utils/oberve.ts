export function observeUnmount(
  targetNode: Node,
  onRemoved: () => void
): () => void {
  const parent = targetNode.parentNode;
  if (!parent) return () => {};

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const removed of Array.from(mutation.removedNodes)) {
        if (removed === targetNode) {
          onRemoved();
          observer.disconnect();
          return;
        }
      }
    }
  });

  observer.observe(parent, { childList: true });
  return () => observer.disconnect();
}
