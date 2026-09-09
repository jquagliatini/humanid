import { test } from "vitest";

import { IdDefinitionHelper } from "./id-definition-helper.js";

const helper = new IdDefinitionHelper();

test("buffer with radix < 2 throws", ({ expect }) => {
  expect(() => helper.buffer({ radix: 1 })).toThrow();
});

test("buffer with radix > 36 throws", ({ expect }) => {
  expect(() => helper.buffer({ radix: 37 })).toThrow();
});

test("buffer with float size throws", ({ expect }) => {
  expect(() => helper.buffer({ size: 3.14 })).toThrow();
});
