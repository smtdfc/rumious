export  function styleHelper(styles) {
  function camelToKebabCase(str) {
    return str.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
  }

  let css = '';

  for (const selector in styles) {
    if (styles.hasOwnProperty(selector)) {
      css += `${selector} {`;

      const properties = styles[selector];
      for (const property in properties) {
        if (properties.hasOwnProperty(property)) {
          const kebabCaseProperty = camelToKebabCase(property);
          css += `${kebabCaseProperty}: ${properties[property]};`;
        }
      }

      css += '} ';
    }
  }

  return css.trim();
}

