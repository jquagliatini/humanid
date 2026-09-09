import { DEFINITION, type IdDefinition } from "./types.js";

export function isIdDefinition(value: unknown): value is IdDefinition {
  return typeof value === "object" && value !== null && DEFINITION in value;
}
