import type { Property } from "./property.ts";

export type PublisherProperty = Omit<Property, "publisherId">;
export type PropertyHistoryEntry = { id: string; action: "created" | "updated" | "paused" | "reactivated" | "deleted"; createdAt: string; previousData: unknown; newData: unknown };
