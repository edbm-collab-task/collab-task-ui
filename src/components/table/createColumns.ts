import type { Column } from "@/types/table";

export function createColumns<T extends object>(
    data: T[],
    labels?: Partial<Record<keyof T, string>>
): Column<T>[] {

    if (data.length === 0) {
        return [];
    }

    return (Object.keys(data[0]) as (keyof T)[]).map(key => ({

        key,

        header: labels?.[key] ?? String(key)

    }));

}