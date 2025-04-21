export function isPrimitive(value: any): boolean {
  return value !== Object(value);
}
