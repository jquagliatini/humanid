import { test } from "vitest";

import { IdDefinitionHelper } from "./id-definition-helper.js";
import { makeId } from "./make-id.js";

const helper = new IdDefinitionHelper();

test("uuid", ({ expect }) => {
  const uuid = makeId(helper.uuid());
  expect(uuid()).toMatch(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
});

test("buffer", ({ expect }) => {
  const buffer = makeId(helper.buffer());
  const id = buffer();
  console.log(id);
  expect(id).toMatch(/[a-z0-9]+/);
});

test("buffer with different sizes", ({ expect }) => {
  const tinyBuffer = makeId(helper.buffer({ size: 5 }));
  const largeBuffer = makeId(helper.buffer({ size: 20 }));

  expect(tinyBuffer().length).toBeLessThan(largeBuffer().length);
});

test("buffer with custom encoding", ({ expect }) => {
  const binaryBuffer = makeId(helper.buffer({ radix: 2 }));

  expect(binaryBuffer()).toMatch(/[01]+/);
});

test("prefixed", ({ expect }) => {
  const prefixed = makeId(helper.prefixed({ prefix: "usr", suffix: helper.buffer() }));
  expect(prefixed()).toMatch(/^usr_[0-9a-z]+/);
});

test("prefixed with suffix factory", ({ expect }) => {
  const prefixed = makeId(helper.prefixed({ prefix: "usr", suffix: (h) => h.uuid() }));
  expect(prefixed()).toMatch(
    /^usr_[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  );
});

test("prefixed with custom join", ({ expect }) => {
  const prefixed = makeId(helper.prefixed({ prefix: "usr", suffix: (h) => h.uuid(), join: "-" }));
  expect(prefixed()).toMatch(
    /^usr-[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  );
});

test("custom", ({ expect }) => {
  let i = 10_000;
  const custom = makeId(helper.custom(() => `id_${++i}`));

  expect(custom()).toBe(`id_${i}`);
});
