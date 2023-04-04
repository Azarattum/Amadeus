/**
 * Creates an attribute-compatible unique identifier
 */
export const uuid = () => "_" + Math.random().toString(36).slice(2);
