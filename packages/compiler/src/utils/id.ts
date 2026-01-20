let count = 0;
export function createID(prefix: string) {
  count++;
  return `${prefix}_${count}`;
}
