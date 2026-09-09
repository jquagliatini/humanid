import { IdDefinitionHelper } from "./id-definition-helper.js";
import { isIdDefinition } from "./is-id-definition.js";
import { makeId } from "./make-id.js";
import type { IdDictionary, RawIdDefinition } from "./types.js";

const MAX_DEPTH = 10;
function toDictionary<T extends RawIdDefinition>(definition: T, depth = 1): IdDictionary<T> {
  if (depth > MAX_DEPTH)
    throw new Error(`the provided id definition is excessively deep (> ${MAX_DEPTH})`);

  const entries = Object.entries(definition).map(([k, maybeDef]) => [
    k,
    isIdDefinition(maybeDef) ? makeId(maybeDef) : toDictionary(maybeDef, depth + 1),
  ]);

  return Object.fromEntries(entries);
}

export function defineIds<T extends RawIdDefinition>(
  factory: (helper: IdDefinitionHelper) => T,
): IdDictionary<T> {
  const def = factory(new IdDefinitionHelper());
  const entries = toDictionary(def);

  return Object.freeze(entries);
}
