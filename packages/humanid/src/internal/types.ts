export const DEFINITION = Symbol();
export type IdDefinition =
  | { [DEFINITION]: "uuid" }
  | { [DEFINITION]: "buffer"; size: number; radix: number }
  | {
      [DEFINITION]: "prefixed";
      prefix: string;
      suffix: Exclude<IdDefinition, { [DEFINITION]: "prefixed" }>;
      join: string;
    }
  | { [DEFINITION]: "custom"; factory: () => string };

const HUMANID = Symbol();
export type HumanId<Brand> = string & { [HUMANID]: Brand };
export type IdFactory<Brand extends string> = {
  (): HumanId<Brand>;
  (id: string): HumanId<Brand>;
};

export type Pascal<T extends string> = T extends `${infer Head}${infer Tail}`
  ? `${Uppercase<Head>}${Tail}`
  : T;

export type AsHumanId<T extends string> = `${Pascal<T>}Id`;

export type IdDictionary<T, prefix extends string = ""> = {
  readonly [K in Extract<keyof T, string>]: T[K] extends IdDefinition
    ? IdFactory<prefix extends "" ? AsHumanId<K> : `${prefix}/${AsHumanId<K>}`>
    : IdDictionary<T[K], prefix extends "" ? Pascal<K> : `${prefix}/${Pascal<K>}`>;
};

export type BuildPath<T, prefix extends string = ""> = {
  [K in Extract<keyof T, string>]: T[K] extends IdDefinition
    ? prefix extends ""
      ? AsHumanId<K>
      : `${prefix}/${AsHumanId<K>}`
    : BuildPath<T[K], prefix extends "" ? Pascal<K> : `${prefix}/${Pascal<K>}`>;
}[Extract<keyof T, string>];

export type RawIdDefinition = {
  [id: string]: IdDefinition | RawIdDefinition;
};
