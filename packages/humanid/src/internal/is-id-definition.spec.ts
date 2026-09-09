import { test } from "vitest";

import { IdDefinitionHelper } from "./id-definition-helper.js";
import { isIdDefinition } from "./is-id-definition.js";

test("IdDefinition detection", ({ expect }) => {
  const h = new IdDefinitionHelper();

  expect(isIdDefinition(h.uuid())).toBe(true);
});

test("IdDefinition non detection", ({ expect }) => {
  expect(isIdDefinition(new Date())).toBe(false);
});
