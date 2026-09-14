import type { HumanId, IdBrands } from "./internal/types.js";

/**
 * expose your own ids with
 *
 * ```
 * const ids = defineIds();
 *
 * declare module 'humanid' {
 *   interface Registry {
 *      ids: typeof ids;
 *   }
 * }
 * ```
 */
export interface Registry {}

type KnownId<R = Registry> = R extends { ids: infer I } ? IdBrands<I> : string;

export type Id<T extends KnownId> = HumanId<T>;

export { defineIds } from "./internal/define-ids.js";
