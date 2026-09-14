import { createDefineIds } from "./builder.js";
import { makeIdBuffer } from "./strategies/buffer.js";
import { makeIdCustom } from "./strategies/custom.js";
import { makeIdPrefixed } from "./strategies/prefixed.js";
import { makeIdUuid } from "./strategies/uuid.js";

export const defineIds = createDefineIds({
  buffer: makeIdBuffer,
  custom: makeIdCustom,
  prefixed: makeIdPrefixed,
  uuid: makeIdUuid,
});
