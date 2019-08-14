/** Add a cb() method on an object, allowing easy call of optional callbacks.
 * 
 * Calling cb(someFunc, arg1, arg2) will call someFunc(arg1, arg2) if someFunc
 * is set, and do nothing otherwise.
 */
export default instance => {
  instance.cb = (cbFunc, ...args) => {
    if (!cbFunc) {
      return;
    }
    return cbFunc(...args);
  };
};