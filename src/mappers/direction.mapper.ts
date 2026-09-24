import type { DirectionRes } from "@/types/direction";

export function toDirectionOptions(
    directions: DirectionRes[]
): { label: string; value: number }[] {

    return directions.map((direction) => ({
        label: direction.name,
        value: direction.directionId,
    }));
}
