export const createInstance = <T extends { id: number }>(
  ctor: new (...args: any[]) => T,
): (() => T) => {
  let instance: T | null = null;
  return () => {
    if (instance) return instance;
    instance = new ctor();
    return instance;
  };
};
