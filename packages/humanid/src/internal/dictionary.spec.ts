import { expectTypeOf, test } from "vitest";

import { defineIds } from "./dictionary.js";
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
