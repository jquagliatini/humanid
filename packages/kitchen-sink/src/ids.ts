import { defineIds } from 'humanid';

export const ids = defineIds(h => ({
  user: h.uuid(),
  email: { attachment: h.uuid() },
}));

declare module "humanid" {
  interface Registry {
    ids: typeof ids;
  }
}
