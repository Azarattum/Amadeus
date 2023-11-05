/**
 * Creates an attribute-compatible unique identifier
 */
export const uuid = () => "_" + Math.random().toString(36).slice(2);

/**
 * Check for iOS devices (including iPhones and iPads)
 */
export function isiOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.platform) ||
    (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1)
  );
}

/**
 * Check whether a given element is scrollable or not
 */
export function isScrollable(element?: HTMLElement | null) {
  if (!element) return false;
  const styles = getComputedStyle(element);
  return /(auto|scroll)/.test(
    styles.overflow + styles.overflowX + styles.overflowY,
  );
}

/**
 * Gets the nearest scrollable parent of an element.
 * If none found returns `document.body`.
 */
export function getScrollParent(element?: HTMLElement | null) {
  while (element && !isScrollable(element) && element !== document.body) {
    element = element?.parentElement;
  }
  return element || document.body;
}
