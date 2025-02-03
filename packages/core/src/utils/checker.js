export function isCamelCase(str) {
  const camelCaseRegex = /^[a-zA-Z]+([A-Z][a-z]*)*$/;
  return camelCaseRegex.test(str);
}

export function isFunction(object) {
  return typeof object === 'function';
}