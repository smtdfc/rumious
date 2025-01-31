module.exports = function(api) {
  api.cache(true);

  return {
    "presets": [
        [
          "@babel/preset-react",
          {
          "pragma": "AURA_JSX_SUPPORT.createElement",
          "pragmaFrag": "AURA_JSX_SUPPORT.createFragment",
          "throwIfNamespace": false,
          "runtime": "classic"
          }
        ]
    ]
  };
};