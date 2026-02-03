export function isComponent(name: string): boolean {
  if (!name) return false;

  if (name.includes(".")) {
    return true;
  }

  const firstChar = name.charAt(0);

  return (
    firstChar === firstChar.toUpperCase() &&
    firstChar !== firstChar.toLowerCase()
  );
}
