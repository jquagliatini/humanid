# HUMANID

the central source of truth for your identifiers

## Why?

Typescript is a structural type system. In the end you have strings everywhere.

With branded ids:

- Mistakes are visible, no more id inversion in parameters

```ts
// before 😢
function unsubscribe(userId: string, subscriptionId: string): Promise<void>;

// after 🥳
function unsubscribe(userId: Id<"UserId">, subscriptionId: Id<"SubscriptionId">): Promise<void>;
```

- Collections can finally express your intent

```ts
// before 😢
function findUsersSubscriptions(userIds: Set<string>): Map<string, { id: string }[]>;

// after 🥳
function findUsersSubscriptions(
  userIds: Set<Id<"UserId">>,
): Map<Id<"UserId">, Id<"SubscriptionId">[]>;
```

With a central id registry:

- It becomes impossible to create duplicated Ids _by design_

```ts
// typescript will prevent this by default
const ids = defineIds((h) => ({ user: h.uuid(), user: h.uuid() }));

// Brands are built by convention
// `UserId` + `Emails/UserId` + `Auth/UserId`
const ids = defineIds((h) => ({
  user: h.uuid(),
  emails: { user: h.uuid() },
  auth: { user: h.uuid() },
}));
```

## How to use

```
pnpm add @jqgl/humanid
```

```ts
// = ids.ts =
import { defineIds } from "@jqgl/humanid";

export const ids = defineIds((h) => ({
  // Each entry will be unique by construction,
  // and have a type alias: `UserId`, `EmailId`, `FileId`
  user: h.uuid(),
  email: h.uuid(),
  file: h.uuid(),
}));

declare module "@jqgl/humanid" {
  interface Registry {
    /**
     * The declaration merging typing
     * `Id<...>` in a safe way.
     * Otherwise, it accepts any string
     */
    ids: typeof ids;
  }
}

// = user.repository.ts =
import type { Id } from "@jqgl/humanid";

import { db } from "@/db.js";

type User = { id: Id<"UserId">; name: string };

// the Id type will only allow the registered Id
export async function findById(id: Id<"UserId">): Promise<User> {
  const user = await db.query.findFirst({
    where: { id }, // id is still a string
    columns: { id: true, name: true },
  });
  if (!user) throw new Error();

  return { id: ids.user(user.id), name: user.name };
}
```

### Namespacing

It's possible to organize your ids in namespaces (⚠️ no more than 10 level deep):

```ts
const ids = defineIds((h) => ({
  users: { user: h.uuid(), subscription: h.uuid(), session: h.uuid() },
  emails: { email: h.uuid(), attachment: h.uuid(), participant: h.uuid() },
}));
```

### Id formats

**UUID**

uses `crypto.randomUUID()` under the hood:

```ts
const ids = defineIds((h) => ({ user: h.uuid() }));
const userId = ids.user();
//    ^ bf54ca8e-a3bf-4cc0-b4af-2f8e89faa1e6
```

**Uint8Array Buffer**

uses `crypto.getRandomValues` with a `Uint8Array` under the hood.

```ts
const ids = defineIds((h) => ({ user: h.buffer() }));
const userId = ids.user();
//    ^ 5h4o411hu2osn5g6w
```

you can configure the size of the buffer, and the radix for int-to-string conversion

```ts
const ids = defineIds((h) => ({ user: h.buffer({ size: 24, radix: 16 }) }));
const userId = ids.user();
//    ^ 91d91f767e3ea0efd596d5682cfc4bfd92dcf9fda8efa
```

**Prefixed**

you can prefix your id with a string, to build an ID _à la Stripe_.

```ts
const ids = defineIds((h) => ({ user: h.prefixed({ prefix: "usr", suffix: h.buffer() }) }));
const userId = ids.user();
//    ^ usr_g4332685v5p423u3119
```

**Custom**

you can use any synchronous function that returns a string

```ts
let i = 10_000n;
const ids = defineIds((h) => ({ user: h.custom(() => `usr_${++i}`) }));
const userId = ids.user();
//    ^ usr_10001
```

### Id strategies extensions

In addition to the inlined custom format, it's possible to extend `defineIds` with your own functions:

```ts
import { defineIds as humanIds } from "@jqgl/humanid";
import cuid from "cuid";

const defineIds = humanIds.extend({ cuid: () => cuid() });

// cuid() is now available
export const ids = defineIds((h) => ({
  user: h.cuid(),
}));
```

### Branding conventions

We follow a convention to build each Id Branding, with some assumptions:

1. Key should not use the `id` suffix, we add it automatically. If your key uses `...Id` the brand will repeat it `...IdId`.

```ts
const ids = defineIds((h) => ({ userId: h.uuid() }));
//    ^ Ids<'UserIdId'>
```

2. Keys should be valid JS class names. Each generated Brand will look like a class name by design.

```ts
const ids = defineIds((h) => ({ user: h.uuid() }));
//    ^ Id<'UserId'> and not Id<'user'> or Id<'userId'>
```

3. Namespaces are separated by `/`

```ts
const ids = defineIds((h) => ({ users: { subscription: h.uuid() } }));
//    ^ Id<'Users/SubscriptionId'>
```

### Things to improve

#### Memory usage

The current design is optimized for stripe ids. It requires each ID definition to
carry their parameters.

At scale, the store could be large, which could be improved.

#### Id formats are not tree-shakable

At the moment, all IDs formats are kept in the bundle. We should provide a way to optimize this
if necessary, e.g. users might want to use `uuid`s only.

The easiest way to provide this would be to improve the DX on the [createDefineIds](./src/internal/builder.ts#62) function.
