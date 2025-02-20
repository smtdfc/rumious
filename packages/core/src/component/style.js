/**
 * Converts a styles object into a valid CSS string with camelCase properties converted to kebab-case.
 * 
 * @param {Object} styles - An object containing CSS selectors as keys and their corresponding properties as values.
 * @returns {string} The generated CSS string.
 * @module rumious
 * @example
 * const styles = {
 *   '.button': {
 *     backgroundColor: 'red',
 *     fontSize: '16px'
 *   },
 *   '#header': {
 *     color: 'blue'
 *   }
 * };
 *
 * const css = styleHelper(styles);
 * console.log(css);
 * // Outputs: ".button { background-color: red; font-size: 16px; } #header { color: blue; }"
 */
export function styleHelper(styles) {
  /**
   * Converts a camelCase string to kebab-case.
   * 
   * @param {string} str - The camelCase string to be converted.
   * @returns {string} The converted kebab-case string.
   */
  function camelToKebabCase(str) {
    return str.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
  }

  let css = '';

  for (const selector in styles) {
    if (Object.prototype.hasOwnProperty.call(styles, selector)) {
      css += `${selector} {`;

      const properties = styles[selector];
      for (const property in properties) {
        if (Object.prototype.hasOwnProperty.call(properties, property)) {
          const kebabCaseProperty = camelToKebabCase(property);
          css += `${kebabCaseProperty}: ${properties[property]};`;
        }
      }

      css += '} ';
    }
  }

  return css.trim();
}