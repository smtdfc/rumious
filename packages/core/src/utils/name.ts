export function extractName(str: string): string {
  const index = str.indexOf('$');
  if (index !== -1) {
    return str.slice(index + 1);
  }
  return ''; 
}