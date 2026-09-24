export function makeIdCustom(options: () => string): string {
  return options();
}
