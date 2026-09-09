import { type Id } from 'humanid';
import { ids } from './ids.js';

type User = { id: Id<"UserId"> }

function describeUser(user: User) {
  console.log(user);
}

describeUser({ id: ids.user() });

// @ts-expect-error
describeUser({ id: ids.email.attachment() })

// @ts-expect-error
export type Failing = Id<"Unknown">;
