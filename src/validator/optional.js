export const optional = otherValidator => value => {
  if (
    value === undefined
    || ((typeof value === "string") && value === "")
  ) {
    return;
  }
  return otherValidator(value);
};
