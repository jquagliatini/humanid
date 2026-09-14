import { expectTypeOf, test } from "vitest";

import { defineIds } from "./define-ids.js";
import type { HumanId } from "./types.js";

test("define ids", ({ expect }) => {
  const ids = defineIds((h) => ({
    users: {
      user: h.uuid(),
      subscriber: h.uuid(),
    },
    emails: {
      email: h.uuid(),
      participant: h.uuid(),
      attachment: h.uuid(),
    },
  }));

  const userId = ids.users.user();

  expect(userId).toBeTypeOf("string");
  expectTypeOf(userId).toEqualTypeOf<HumanId<"Users/UserId">>();

  const emailId = ids.emails.email(`my-email-id`);

  expect(emailId).toBe(`my-email-id`);
  expectTypeOf(emailId).toEqualTypeOf<HumanId<"Emails/EmailId">>();
});

test("more than 10 level deep throws", ({ expect }) => {
  expect(() =>
    defineIds((h) => ({
      a: { b: { c: { d: { e: { f: { g: { h: { i: { j: { k: h.uuid() } } } } } } } } } },
    })),
  ).toThrow();
});

test("all strategies", ({ expect }) => {
  const UUID_RE = "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";

  const ids = defineIds((h) => ({
    asUuid: h.uuid(),
    asBuffer: h.buffer(),
    asCustom: h.custom(() => `CUSTOM--${Math.trunc(Math.random() * 1e6)}`),

    asPrefixedWithBuffer: h.prefixed({ prefix: "usr1", suffix: h.buffer() }),
    asPrefixedWithUuid: h.prefixed({ prefix: "usr2", suffix: h.uuid() }),
    asPrefixedWithCustom: h.prefixed({
      prefix: "usr3",
      suffix: h.custom(() => `CUSTOM--${Math.trunc(Math.random() * 1e6)}`),
    }),
  }));

  expect(ids.asBuffer()).toMatch(/^[a-z0-9]+$/);
  expect(ids.asCustom()).toMatch(/^CUSTOM--\d+$/);
  expect(ids.asUuid()).toMatch(new RegExp(`^${UUID_RE}$`));

  expect(ids.asPrefixedWithBuffer()).toMatch(/^usr1_[a-z0-9]+$/);
  expect(ids.asPrefixedWithUuid()).toMatch(new RegExp(`^usr2_${UUID_RE}$`));
  expect(ids.asPrefixedWithCustom()).toMatch(/^usr3_CUSTOM--\d+$/);
});
