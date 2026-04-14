export function createCounter(initial = 0) {
  let value = initial;

  return {
    get value() {
      return value;
    },
    increment() {
      value += 1;
      return value;
    }
  };
}
