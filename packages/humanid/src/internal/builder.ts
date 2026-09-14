import {
    DEFINITION,
    type AbstractIdDefinition,
    type HumanId,
    type IdFactory,
    type IdStore,
    type RawIdDefinition,
    type ResolvedIdStore,
} from "./types.js";

type Pretty<T> = { [K in keyof T]: T[K] } & {};

type FactoryHelper = {
  makeId(def: AbstractIdDefinition): IdFactory<string>;
};

type InternalIdFactory = (options: any, helper: FactoryHelper) => string;
type InternalIdFactories = Record<string, InternalIdFactory>;

export type Helper<H extends InternalIdFactories> = {
  [K in keyof H]: Parameters<H[K]> extends []
    ? () => { [DEFINITION]: K }
    : undefined extends Parameters<H[K]>[0]
      ? (options?: Parameters<H[K]>[0]) => Pretty<{ [DEFINITION]: K } & Parameters<H[K]>[0]>
      : (options: Parameters<H[K]>[0]) => Pretty<{ [DEFINITION]: K } & Parameters<H[K]>[0]>;
};

type IdStoreFactory<H extends InternalIdFactories> = {
  <T extends RawIdDefinition>(factory: (helper: Helper<H>) => T): ResolvedIdStore<IdStore<T>>;

  extend<Extended extends InternalIdFactories>(
    factories: Extended,
  ): IdStoreFactory<Pretty<Omit<Extended, keyof H> & H>>;
};

function isIdDefinition(value: unknown): value is AbstractIdDefinition {
  return typeof value === "object" && value !== null && DEFINITION in value;
}

function traverseDef<T extends RawIdDefinition>(
  makeId: (def: AbstractIdDefinition) => (id?: string) => string,
  currentDefinition: T,
  depth = 1,
): IdStore<T> {
  if (depth > 10) throw new Error(`the provided id definition is excessively deep (> 10)`);
  const entries = Object.entries(currentDefinition).map(([k, maybeDef]) => [
    k,
    isIdDefinition(maybeDef) ? makeId(maybeDef) : traverseDef(makeId, maybeDef, depth + 1),
  ]);

  return Object.fromEntries(entries);
}

const kPositional = Symbol();
function toDefinition(k: string): (options: unknown) => AbstractIdDefinition {
  return (arg: unknown) =>
    typeof arg === "object" && arg !== null
      ? { ...arg, [DEFINITION]: k }
      : { [kPositional]: arg, [DEFINITION]: k };
}

export function createDefineIds<T extends Record<string, InternalIdFactory>>(
  factories: T,
): IdStoreFactory<T> {
  const helper = Object.fromEntries(
    Object.keys(factories).map((k) => [k, toDefinition(k)] as const),
  ) as Helper<T>;
  const makeId = (def: AbstractIdDefinition): ((id?: string) => HumanId<string>) => {
    const { [DEFINITION]: defType, ...options } = def;
    const factory = factories[defType];
    if (!factory) throw new Error(`unknown id "${defType}"`);

    const params = kPositional in options ? options[kPositional] : options;
    return (id?: string) => (id || factory(params, { makeId })) as HumanId<string>;
  };

  function defineIds<Def extends RawIdDefinition>(
    factory: (helper: Helper<T>) => Def,
  ): ResolvedIdStore<IdStore<Def>> {
    const idDefinitions = factory(helper);
    return Object.freeze(traverseDef(makeId, idDefinitions)) as ResolvedIdStore<IdStore<Def>>;
  }

  defineIds.extend = <Extended extends InternalIdFactories>(
    extensions: Extended,
  ): IdStoreFactory<Pretty<Omit<Extended, keyof T> & T>> =>
    createDefineIds<Pretty<Omit<Extended, keyof T> & T>>({ ...extensions, ...factories });

  return defineIds;
}
