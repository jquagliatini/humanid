import { makeIdBuffer } from "./formats/buffer.js";
import { makeIdCustom } from "./formats/custom.js";
import { makeIdPrefixed } from "./formats/prefixed.js";
import { makeIdUuid } from "./formats/uuid.js";
import { makeStore, type IdStore } from "./store.js";

export const defineIds: IdStore<{
  uuid: typeof makeIdUuid;
  buffer: typeof makeIdBuffer;
  custom: typeof makeIdCustom;
  prefixed: typeof makeIdPrefixed;
}> = makeStore({
  uuid: makeIdUuid,
  buffer: makeIdBuffer,
  custom: makeIdCustom,
  prefixed: makeIdPrefixed,
});

export type { HumanId, Id, Registry } from "./store.js";
