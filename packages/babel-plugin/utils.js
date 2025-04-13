
function randomName(prefix) {
  return `_${prefix}_${Math.random().toString(16).slice(2, 10)}`;
}

module.exports = { randomName };