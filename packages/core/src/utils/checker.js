export function isCamelCase(str) {
  const camelCaseRegex = /^[a-z]+([A-Z][a-z]*)*$/;
  return camelCaseRegex.test(str);
}