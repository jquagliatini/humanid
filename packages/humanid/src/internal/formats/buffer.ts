function assertPositiveInteger(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0)
    throw new Error(`Positive integer expected, "${String(value)}" provided`);

  return n;
}

type MakeIdBufferOptions = {
  /**
   * provided to Number.prototype.toString(),
   * should be 2 <= radix <= 36
   *
   * @default 36
   */
  radix?: number;

  /**
   * the underlying Uint8Array size
   *
   * @default 10
   */
  size?: number;
};

export function makeIdBuffer(options: MakeIdBufferOptions = {}): string {
  const radix = assertPositiveInteger(options.radix ?? 36);
  const size = assertPositiveInteger(options.size ?? 10);

  if (radix < 2 || radix > 36) throw new Error(`radix should be 2 <= radix <= 36`);

  return [...crypto.getRandomValues(new Uint8Array(size))].map((x) => x.toString(radix)).join("");
}
