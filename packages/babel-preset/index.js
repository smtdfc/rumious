const path = require('path');

module.exports = function(api) {
  api.cache(true);

  return {
    'presets': [
        [
          '@babel/preset-react',
          {
          'pragma': 'RUMIOUS_JSX_SUPPORT.createElement',
          'pragmaFrag': 'RUMIOUS_JSX_SUPPORT.createFragment',
          'throwIfNamespace': false,
          'runtime': 'classic'
          }
        ]
    ],
    'plugins':[
      path.join(__dirname,'./tranforms')
    ]
  };
};