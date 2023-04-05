export type Either<T extends string> = {
  [K in T]: {
    [U in T]?: U extends K ? true : false;
  };
}[T];
