import { test } from "vitest";

import { makeIdBuffer } from "./buffer.js";

test("buffer", ({ expect }) => {
  const id = makeIdBuffer();
  expect(id).toMatch(/[a-z0-9]+/);
});

test("buffer with different sizes", ({ expect }) => {
  const tinyBuffer = makeIdBuffer({ size: 5, radix: 10 });
  const largeBuffer = makeIdBuffer({ size: 20 });

  expect(tinyBuffer.length).toBeLessThan(largeBuffer.length);
});

test("buffer with custom encoding", ({ expect }) => {
  const binaryBuffer = makeIdBuffer({ radix: 2 });

  expect(binaryBuffer).toMatch(/[01]+/);
});

test.for([
  { size: 0, radix: undefined, message: `Positive integer expected, "0" provided` },
  { size: -1, radix: undefined, message: `Positive integer expected, "-1" provided` },
  { size: 42.42, radix: undefined, message: `Positive integer expected, "42.42" provided` },
  { size: undefined, radix: 0, message: `Positive integer expected, "0" provided` },
  { size: undefined, radix: -1, message: `Positive integer expected, "-1" provided` },
  { size: undefined, radix: 42.42, message: `Positive integer expected, "42.42" provided` },
  { size: undefined, radix: 42, message: `radix should be 2 <= radix <= 36` },
])(
  `makeIdBuffer({ size: $size, radix: $radix }) throws with "$message"`,
  ({ size, radix, message }, { expect }) => {
    const options: { radix?: number; size?: number } = {};
    if (typeof size === "number") options.size = size;
    if (typeof radix === "number") options.radix = radix;

    expect(() => makeIdBuffer(options)).toThrow(message);
  },
);
