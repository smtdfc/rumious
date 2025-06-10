const { declare } = require('@babel/helper-plugin-utils');
const {} = require('rumious-compiler');

module.exports = declare((api) => {
  api.assertVersion(7);
  const t = api.types;

  return {
    name: 'rumious-babel-plugin',
    visitor: {
      JSXElement(path) {},
    },
  };
});
