export const DEFINITION = Symbol();

const HUMANID = Symbol();
export type HumanId<Brand> = string & { [HUMANID]: Brand };
export type IdFactory<Brand extends string> = {
  (): HumanId<Brand>;
  (id: string): HumanId<Brand>;
};

type Pascal<T extends string> = T extends `${infer Head}${infer Tail}`
  ? `${Uppercase<Head>}${Tail}`
  : T;

type AsHumanId<T extends string> = `${Pascal<T>}Id`;
export type IdStore<T, prefix extends string = ""> = {
  readonly [K in Extract<keyof T, string>]: T[K] extends { [DEFINITION]: string }
    ? IdFactory<prefix extends "" ? AsHumanId<K> : `${prefix}/${AsHumanId<K>}`>
    : IdStore<T[K], prefix extends "" ? Pascal<K> : `${prefix}/${Pascal<K>}`>;
};

/**
 * This keeps the internal {@link DEFINITION} symbol out of the emitted
 * declaration files of consumers (which otherwise cannot name it).
 */
export type ResolvedIdStore<T> =
  T extends IdFactory<infer Brand>
    ? IdFactory<Brand>
    : { readonly [K in keyof T]: ResolvedIdStore<T[K]> } & {};

/**
 * Collects the union of every {@link IdFactory} brand (i.e. the fully-qualified
 * id path such as `"UserId"` or `"Email/AttachmentId"`) from a resolved
 * {@link IdStore} tree.
 */
export type IdBrands<T> =
  T extends IdFactory<infer Brand> ? Brand : { [K in keyof T]: IdBrands<T[K]> }[keyof T];

export type AbstractIdDefinition = { [DEFINITION]: string; [id: string]: unknown };

export type RawIdDefinition = {
  [id: string]: AbstractIdDefinition | RawIdDefinition;
};
