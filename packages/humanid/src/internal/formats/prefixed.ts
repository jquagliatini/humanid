import type { IdFactoryHelper } from "../store.js";

export function makeIdPrefixed(
  options: { join?: string; prefix: string; suffix: { name: string; options: unknown } },
  helper: IdFactoryHelper,
): string {
  const { prefix, suffix, join = "_" } = options;
  return [prefix, helper.makeId(suffix)].join(join);
}
