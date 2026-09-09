import { DEFINITION, type IdDefinition } from "./types.js";

function toValidInt(n: unknown): number {
  const nn = Number(n);
  if (!Number.isFinite(n) || !Number.isInteger(nn) || nn <= 0)
    throw new Error(`a positive integer expected`);

  return nn;
}

/** @internal */
export class IdDefinitionHelper {
  private static readonly DEFAULT_BUFFER_SIZE = 10;
  private static readonly DEFAULT_BUFFER_RADIX = 36;

  uuid(): IdDefinition {
    return { [DEFINITION]: "uuid" as const };
  }

  buffer(options: { size?: number; radix?: number } = {}): IdDefinition {
    if (options.radix && (options.radix < 2 || options.radix > 36))
      throw new Error(`radix should be 2 <= radix <= 36`);
    const radix = options.radix
      ? toValidInt(options.radix)
      : IdDefinitionHelper.DEFAULT_BUFFER_RADIX;

    const size = toValidInt(options.size ?? IdDefinitionHelper.DEFAULT_BUFFER_SIZE);

    return { [DEFINITION]: "buffer", size, radix };
  }

  prefixed(options: {
    prefix: string;
    join?: string;
    suffix: IdDefinition | ((helper: Omit<IdDefinitionHelper, "prefixed">) => IdDefinition);
  }): IdDefinition {
    const { suffix: _suffix, join = "_", prefix } = options;
    const suffix = typeof _suffix === "function" ? _suffix(this) : _suffix;

    if (suffix[DEFINITION] === "prefixed")
      throw new Error(`invalid IdDefinition provided as suffix: "prefixed"`);

    return { [DEFINITION]: "prefixed", prefix, suffix, join };
  }

  custom(factory: () => string): IdDefinition {
    return { [DEFINITION]: "custom", factory };
  }
}
