import { DEFINITION, type HumanId, type IdDefinition, type IdFactory } from "./types.js";

type IdStrategy = () => string;

function makeIdBuffer(definition: Extract<IdDefinition, { [DEFINITION]: "buffer" }>): IdStrategy {
  return () =>
    [...crypto.getRandomValues(new Uint8Array(definition.size))]
      .map((x) => x.toString(definition.radix))
      .join("");
}

function makeIdCustom(def: Extract<IdDefinition, { [DEFINITION]: "custom" }>): IdStrategy {
  return def.factory;
}

function makeIdUuid(): IdStrategy {
  return () => crypto.randomUUID();
}

function makeIdPrefixed(def: Extract<IdDefinition, { [DEFINITION]: "prefixed" }>): IdStrategy {
  const prefix = def.prefix;
  const suffix = makeId(def.suffix);

  return () => [prefix, suffix()].join(def.join);
}

function factory<Brand extends string>(strategy: IdStrategy): IdFactory<Brand> {
  return (id?: string): HumanId<Brand> => (id || strategy()) as HumanId<Brand>;
}

function findStrategy(definition: IdDefinition): IdStrategy {
  switch (definition[DEFINITION]) {
    case "custom":
      return makeIdCustom(definition);
    case "buffer":
      return makeIdBuffer(definition);
    case "prefixed":
      return makeIdPrefixed(definition);
    case "uuid":
      return makeIdUuid();
  }
}

export function makeId(definition: IdDefinition): IdFactory<string> {
  return factory(findStrategy(definition));
}
