/**
 * Checks if the given string is in camelCase format.
 * @module rumious
 * @param {string} str - The string to check.
 * @returns {boolean} - True if the string is in camelCase, false otherwise.
 */
export function isCamelCase(str) {
  const camelCaseRegex = /^[a-zA-Z]+([A-Z][a-z]*)*$/;
  return camelCaseRegex.test(str);
}

/**
 * Checks if the given object is a function.
 * @module rumious
 * @param {any} object - The object to check.
 * @returns {boolean} - True if the object is a function, false otherwise.
 */
export function isFunction(object) {
  return typeof object === 'function';
}

/**
 * Checks if the given value is a primitive (null, string, number, boolean, symbol, undefined).
 * @module rumious
 * @param {any} value - The value to check.
 * @returns {boolean} - True if the value is a primitive, false otherwise.
 */
export function isPrimitive(value) {
  return value === null || (typeof value !== 'object' && typeof value !== 'function');
}