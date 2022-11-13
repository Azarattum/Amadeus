function errorify(what: unknown): Error {
  return what instanceof Error
    ? what
    : new Error(typeof what === "string" ? what : JSON.stringify(what));
}

function handle<T = void>(
  error: unknown,
  catcher?: (error: Error) => void,
  fallback?: T
) {
  const exception = errorify(error);
  if (!catcher) throw exception;
  catcher(exception);
  return fallback;
}

export { errorify, handle };
