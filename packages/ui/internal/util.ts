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
