import { test } from "vitest";

import { createDefineIds } from "./builder.js";
import { DEFINITION } from "./types.js";

test("createDefineIds", ({ expect }) => {
  const defineIds = createDefineIds({
    uuid: () => crypto.randomUUID() as string,
  });

  const ids = defineIds((h) => ({ users: { user: h.uuid() } }));

  const userId = ids.users.user();

  expect(userId).toBeTypeOf("string");
});

test("createDefineIds.extend", ({ expect }) => {
  const defineIds = createDefineIds({ uuid: () => crypto.randomUUID() }).extend({
    custom: (factory: () => string) => factory(),
  });

  const ids = defineIds((h) => ({ users: { user: h.custom(() => "124961234") } }));

  const userId = ids.users.user();
  expect(userId).toBe("124961234");
});

test("createDefineIds.extend keeps the first definition", ({ expect }) => {
  const defineIds = createDefineIds({ uuid: () => "first" }).extend({ uuid: () => "second" });

  const ids = defineIds((h) => ({ users: { user: h.uuid() } }));

  const userId = ids.users.user();
  expect(userId).toBe("first");
});

// TYPINGS EDGE CASES

test("throws on unknown definition", ({ expect }) => {
  const defineIds = createDefineIds({ uuid: () => "uuid" });
  expect(() => defineIds(() => ({ user: { [DEFINITION]: "foo" } }))).toThrow(`unknown id "foo"`);
});

test("throws on invalid definition", ({ expect }) => {
  const defineIds = createDefineIds({ uuid: () => "uuid" });

  // @ts-expect-error
  const ids = defineIds(() => ({ user: new Date() }));

  // @ts-expect-error
  expect(() => ids.user()).toThrow("ids.user is not a function");
});

test("throws with undefined values", ({ expect }) => {
  const defineIds = createDefineIds({ uuid: () => "uuid" });

  // @ts-expect-error
  expect(() => defineIds(() => ({ user: undefined }))).toThrow(
    "Cannot convert undefined or null to object",
  );
});
