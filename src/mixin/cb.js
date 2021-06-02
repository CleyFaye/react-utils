/**
 * Add three methods to the object for easy optional callback calling:
 * - cb(): call of optional callback.
 * - cbProm(): call of optional callback that could be a promise or not. Return
 *             a promise in both case that resolve with the callback result
 * - cbValue(): call of optional callback that can be either a function that
 *              returns a promise, a function that returns a value, or a value.
 *              In any case returns the final value.
 *
 * Calling cb(someFunc, arg1, arg2) will call someFunc(arg1, arg2) if someFunc
 * is set, and do nothing otherwise.
 * Similar rules applies to cbProm() and cbValue().
 */
export default instance => {
  instance.cb = (cbFunc, ...args) => {
    if (!cbFunc) {
      return;
    }
    return cbFunc(...args);
  };
  instance.cbProm = (cbFunc, ...args) => {
    if (!cbFunc) {
      return Promise.resolve();
    }
    return Promise.resolve()
      .then(() => cbFunc(...args));
  };
  instance.cbValue = (cbFunc, ...args) => {
    if (cbFunc === undefined) {
      return Promise.resolve();
    }
    if (cbFunc instanceof Function) {
      return instance.cbProm(cbFunc, ...args);
    }
    return Promise.resolve(cbFunc);
  };
};
