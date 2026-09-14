import type { AbstractIdDefinition } from "../types.js";

export function makeIdPrefixed(
  options: { join?: string; prefix: string; suffix: AbstractIdDefinition },
  helper: { makeId: (def: AbstractIdDefinition) => (id?: string) => string },
): string {
  const { prefix, suffix, join = "_" } = options;
  return [prefix, helper.makeId(suffix)()].join(join);
}
