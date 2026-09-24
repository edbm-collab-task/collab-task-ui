import type { Status } from "@/types/status";

interface StatusSeed {
    id: number;
    name: string;
}

export function toStatusListFromSeed(
    seeds: readonly StatusSeed[]
): Status[] {

    return seeds.map((seed) => ({
        statusId: seed.id,
        name: seed.name,
        sortOrder: 0,
    }));
}
