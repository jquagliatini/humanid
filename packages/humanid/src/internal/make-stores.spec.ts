import { test } from "vitest";

import { makeStore, type Id } from "./store.js";

test("makeStore should make a centralized store", ({ expect }) => {
  const defineIds = makeStore({
    uuid: () => crypto.randomUUID(),
  });

  const ids = defineIds((h) => ({
    users: { user: h.uuid(), email: h.uuid() },
  }));

  const userId: Id<"Users/User"> = ids.users.user();
  expect(userId).toBeTypeOf("string");

  const emailId: Id<"Users/Email"> = ids.users.email();
  expect(emailId).toBeTypeOf("string");

  /** placeholder function to check types */
  function something(_userId: Id<"Users/User">): void {
    /** noop  */
  }

  something(userId);
  // @ts-expect-error: Argument of type 'Id<"Users/Email">' is not assignable to parameter of type 'Id<"Users/User">'.
  something(emailId);

  const rehydratedUserId: Id<"Users/User"> = ids.users.user("user-id");
  expect(rehydratedUserId).toBe("user-id");

  const rehydratedEmailId: Id<"Users/Email"> = ids.users.email("email-id");
  expect(rehydratedEmailId).toBe("email-id");
});

test("makeStore().extend() should add new factories", ({ expect }) => {
  const origin = makeStore({ origin: () => "origin" });
  const extended = origin.extend({ extended: () => "extended" });

  const ids = extended((h) => ({ asExtended: h.extended() }));
  const id = ids.asExtended();

  expect(id).toBe("extended");
});

test("store can create fixed id formats", ({ expect }) => {
  const defineIds = makeStore({
    uuid: () => crypto.randomUUID(),
    withOptions: (options: { value?: number } = {}) =>
      (options.value ?? Math.round(Math.random() * 1e6)).toString(36),
  });

  const ids = defineIds.uuid((__) => ({ user: __, email: __ }));

  const UUID_RE = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
  expect(ids.user()).toMatch(UUID_RE);
  expect(ids.email()).toMatch(UUID_RE);

  const withoutOptions = defineIds.withOptions((__) => ({ user: __ }));
  expect(withoutOptions.user()).toBeTypeOf("string");

  const withOptions = defineIds.withOptions({ value: Math.round(Math.random() * 1e3) }, (__) => ({
    user: __,
  }));
  expect(withOptions.user()).toBeTypeOf("string");
});

test("store with more than 10 levels deep should throw", ({ expect }) => {
  const defineIds = makeStore({ uuid: () => crypto.randomUUID() });
  expect(() =>
    defineIds((h) => ({
      1: { 2: { 3: { 4: { 5: { 6: { 7: { 8: { 9: { 10: { 11: h.uuid() } } } } } } } } } },
    })),
  ).toThrow("the definition is too deep (>10)");
});
