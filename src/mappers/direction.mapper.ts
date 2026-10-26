import type { DirectionRes } from "@/types/direction";

export function toDirectionOptions(
    directions: DirectionRes[],
    includeNone = false
): { label: string; value: number | string }[] {

    const options = directions.map((direction) => ({
        label: direction.name,
        value: direction.directionId,
    }));

    return includeNone
        ? [{ label: "Aucune direction", value: "" }, ...options]
        : options;
}
