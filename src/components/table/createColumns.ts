import type { Column } from "@/types/table";

export function createColumns<T extends object>(
    data: T[],
    labels?: Partial<Record<keyof T, string>>,
    visibleColumns?: (keyof T)[]
): Column<T>[] {

    if (data.length === 0) {
        return [];
    }

    const keys = visibleColumns
        ?? (Object.keys(data[0]) as (keyof T)[]);

    return keys.map(key => ({
        key,
        header: labels?.[key] ?? String(key)
    }));
}