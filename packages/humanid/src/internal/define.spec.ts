import { test } from "vitest";

import { defineIds } from "./define.js";
import type { Id } from "./store.js";

test("defineIds", ({ expect }) => {
  let index = 10_000n;
  const ids = defineIds((h) => ({
    asUuid: h.uuid(),
    asBuffer: h.buffer(),
    asCustom: h.custom(() => `${++index}`),
    asPrefixed: h.prefixed({ prefix: "usr", suffix: h.buffer({ size: 5 }) }),
  }));

  const asUuid: Id<"AsUuid"> = ids.asUuid();
  expect(asUuid).toMatch(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);

  const asBuffer: Id<"AsBuffer"> = ids.asBuffer();
  expect(asBuffer).toMatch(/^[0-9a-z]+$/);

  const asCustom: Id<"AsCustom"> = ids.asCustom();
  expect(asCustom).toMatch(/^\d+$/);

  const asPrefixed: Id<"AsPrefixed"> = ids.asPrefixed();
  expect(asPrefixed).toMatch(/^usr_[0-9a-z]+$/);
});
