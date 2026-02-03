export function isComponentName(name: string): boolean {
  if (!name || typeof name !== "string") return false;
  const componentRegex = /^[A-Z][a-zA-Z0-9]*$/;

  return componentRegex.test(name);
}

export function getRelativePath(
  parentPath: string,
  childPath: string,
): string | null {
  if (childPath.startsWith(parentPath)) {
    return childPath.slice(parentPath.length);
  }
  return null;
}
