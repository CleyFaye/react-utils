export const notEmpty = message => value => {
  if (value.length == 0) {
    return message;
  }
};