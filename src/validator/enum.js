export const inEnum = (values, message) => value => {
  if (!values.includes(value)) {
    return message 
      || `Must be one of ${values.map(val => `"${val}"`).join(",")}`;
  }
};
