import type { Column } from "@/types/table";

export function createColumns<T extends object>(
    data: T[],
    labels?: Partial<Record<keyof T, string>>,
    visibleColumns?: (keyof T | Column<T>)[]
): Column<T>[] {

    const first = data[0];

    if (!first) {
        return [];
    }

    const keys = visibleColumns
        ?? (Object.keys(first) as (keyof T)[]);

    return keys.map(item => {

        if (typeof item === "object" && item !== null && "key" in item) {
            return item as Column<T>;
        }

        const key = item as keyof T;

        return {
            key,
            header: labels?.[key] ?? String(key)
        };
    });
}