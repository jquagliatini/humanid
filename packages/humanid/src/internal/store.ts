const HUMANID = Symbol();
export type HumanId<Brand extends string> = { [HUMANID]: Brand } & string;

type MakeId<Brand extends string> = {
  (): HumanId<Brand>;
  (id: string): HumanId<Brand>;
};

export class IdDefinition<Name extends string = string, Options = unknown> {
  constructor(
    readonly name: Name,
    readonly options: Options,
  ) {}
}

export type IdFactoryHelper = { makeId(def: IdDefinition): string };
type IdFactory = (options: any, helper: IdFactoryHelper) => string;

type Helper<Factories extends Record<string, IdFactory>> = {
  [K in Extract<keyof Factories, string>]: Parameters<Factories[K]> extends []
    ? () => IdDefinition<K, never>
    : undefined extends Parameters<Factories[K]>[0]
      ? (options?: Parameters<Factories[K]>[0]) => IdDefinition<K, Parameters<Factories[K]>[0]>
      : (options: Parameters<Factories[K]>[0]) => IdDefinition<K, Parameters<Factories[K]>[0]>;
};

class FactoryStore<Factories extends Record<string, IdFactory>> {
  private readonly factories = new Map<string, IdFactory>();

  readonly helper: Helper<Factories>;

  constructor(factories: Factories) {
    this.factories = new Map(Object.entries(factories));
    this.helper = this.buildHelper();
  }

  extend<const Extension extends Record<string, IdFactory>>(
    extension: Extension,
  ): FactoryStore<Omit<Factories, keyof Extension> & Extension> {
    const entries = Array.from(this.factories.entries()).concat(Object.entries(extension));
    return new FactoryStore<any>(Object.fromEntries(entries));
  }

  apply<Brand extends string>(def: IdDefinition): HumanId<Brand> {
    const helper = { makeId: (def: IdDefinition) => this.apply(def) };

    const factory = this.get(def.name);
    return factory(def.options, helper) as HumanId<Brand>;
  }

  make<Brand extends string>(def: IdDefinition): MakeId<Brand> {
    return (id?: string) => (id || this.apply(def)) as HumanId<Brand>;
  }

  private get(key: string): IdFactory {
    const factory = this.factories.get(key);
    if (!factory) throw new Error(`Unknown factory: "${key}"`);

    return factory;
  }

  buildFixed(): IdStoreFixed<Factories> {
    const make = (k: string) => {
      return (
        ...args:
          | [factory: (def: IdDefinition) => IdDefs]
          | [options: unknown, factory: (def: IdDefinition) => IdDefs]
      ) => {
        let def: IdDefs;

        if (args.length == 1) {
          def = args[0](new IdDefinition(k, undefined));
        } else if (args.length === 2) {
          const [options, factory] = args;
          def = factory(new IdDefinition(k, options));
        } else {
          throw new Error(`Invalid arguments provided`);
        }

        return toIdMaker(this, def);
      };
    };

    return Object.fromEntries(this.factories.keys().map((k) => [k, make(k)])) as any;
  }

  private buildHelper(): Helper<Factories> {
    const factories = this.factories;
    return new Proxy(
      {},
      {
        get(t, p, r) {
          if (typeof p !== "string" || !factories.has(p)) return Reflect.get(t, p, r);

          return (options: any) => new IdDefinition(p, options);
        },
      },
    ) as any;
  }
}

export type IdDefs = {
  [id: string]: IdDefinition | IdDefs;
};

type Pascal<T extends string> = T extends `${infer Head}${infer Tail}`
  ? `${Uppercase<Head>}${Tail}`
  : T;

type IdMaker<Defs, prefix extends string = ""> = {
  readonly [K in Extract<keyof Defs, string>]: Defs[K] extends IdDefinition
    ? MakeId<prefix extends "" ? Pascal<K> : `${prefix}/${Pascal<K>}`>
    : IdMaker<Defs[K], prefix extends "" ? Pascal<K> : `${prefix}/${Pascal<K>}`>;
};

function toIdMaker<Factories extends Record<string, IdFactory>, Defs extends IdDefs>(
  store: FactoryStore<Factories>,
  def: Defs,
  depth = 1,
): IdMaker<Defs> {
  if (depth >= 10) throw new Error(`the definition is too deep (>10)`);

  return Object.freeze(
    Object.fromEntries(
      Object.entries(def).map(([k, v]) =>
        v instanceof IdDefinition ? [k, store.make(v)] : [k, toIdMaker(store, v, depth + 1)],
      ),
    ),
  );
}

type FixedFactory<F extends IdFactory> =
  Parameters<F> extends []
    ? <Defs extends IdDefs>(factory: (def: IdDefinition) => Defs) => IdMaker<Defs>
    : undefined extends Parameters<F>[0]
      ? <Defs extends IdDefs>(
          ...args:
            | [factory: (def: IdDefinition) => Defs]
            | [options: NonNullable<Parameters<F>[0]>, factory: (def: IdDefinition) => Defs]
        ) => IdMaker<Defs>
      : <Defs extends IdDefs>(
          options: Parameters<F>[0],
          factory: (def: IdDefinition) => Defs,
        ) => IdMaker<Defs>;

type IdStoreFunction<Factories extends Record<string, IdFactory>> = <const Defs extends IdDefs>(
  factory: (helper: Helper<Factories>) => Defs,
) => IdMaker<Defs>;
type IdStoreFixed<Factories extends Record<string, IdFactory>> = {
  readonly [K in Extract<keyof Factories, string>]: FixedFactory<Factories[K]>;
};

export type IdStore<Factories extends Record<string, IdFactory>> = IdStoreFunction<Factories> &
  Omit<IdStoreFixed<Factories>, "extend"> & {
    extend<Extension extends Record<string, IdFactory>>(
      extension: Extension,
    ): IdStore<Omit<Factories, keyof Extension> & Extension>;
  };

function makeDefineIds<Factories extends Record<string, IdFactory>>(
  store: FactoryStore<Factories>,
): IdStore<Factories> {
  const defineIds: IdStoreFunction<Factories> = <const Defs extends IdDefs>(
    factory: (helper: Helper<Factories>) => Defs,
  ): IdMaker<Defs> => {
    const defs = factory(store.helper);
    return toIdMaker(store, defs);
  };

  Object.assign(defineIds, {
    ...store.buildFixed(),
    extend: <Extension extends Record<string, IdFactory>>(extension: Extension) =>
      makeDefineIds(store.extend(extension)),
  });

  return defineIds as IdStore<Factories>;
}

export function makeStore<const Factories extends Record<string, IdFactory>>(
  factories: Factories,
): IdStore<Factories> {
  const store = new FactoryStore(factories);
  return makeDefineIds(store);
}

/**
 * expose your own ids with
 *
 * ```
 * const ids = defineIds();
 *
 * declare module '@jqgl/humanid' {
 *   interface Registry {
 *      ids: typeof ids;
 *   }
 * }
 * ```
 */
export interface Registry {}

type ExtractBrands<M> = {
  [K in keyof M]: M[K] extends MakeId<infer B extends string> ? B : ExtractBrands<M[K]>;
}[keyof M];
type KnownId<R = Registry> = R extends { ids: infer Store } ? ExtractBrands<Store> : string;

export type Id<Brand extends KnownId> = HumanId<Brand>;
