export function extractName(str: string): string {
  const index = str.indexOf('$');
  if (index !== -1) {
    return str.slice(index + 1);
  }
  return ''; 
}

export function generateName(prefix: string="_"): string {
  return  `${prefix}${(Math.floor(Math.random()*9999)*Date.now()).toString(32)}`
}