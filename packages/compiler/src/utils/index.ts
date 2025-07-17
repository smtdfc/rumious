export function mergePrimitives<A extends object, B extends object>(
  a: A,
  b: B,
): B & Partial<A> {
  const result = { ...b } as B & Partial<A>;
  for (const key in a) {
    if (!(key in b)) {
      (result as any)[key] = a[key];
    }
  }
  return result;
}

export function isObject(value: any): value is object {
  return value && typeof value === 'object' && !Array.isArray(value);
}
