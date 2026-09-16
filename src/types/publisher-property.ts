import type { Property } from "./property.ts";
import type { PublicPropertyDetailDto } from "./public-property.ts";

export type PublisherProperty = Property;
export interface PublisherPropertyDto extends PublicPropertyDetailDto {
	country?: string | null;
	publisherId: number;
	publicationStatus: string;
	updatedAt: string;
}
export type PropertyHistoryEntry = { id: string; action: "created" | "updated" | "paused" | "reactivated" | "deleted"; createdAt: string; previousData: unknown; newData: unknown };
