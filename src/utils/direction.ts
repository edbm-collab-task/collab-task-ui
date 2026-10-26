export function parseDirectionIdInput(
    value: unknown
): number | null | undefined {

    if (value === undefined) {
        return undefined;
    }

    if (value === null || value === "") {
        return null;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : undefined;
    }

    if (typeof value === "string") {
        const trimmed = value.trim();

        if (trimmed === "") {
            return null;
        }

        const parsed = Number(trimmed);

        return Number.isFinite(parsed) ? parsed : undefined;
    }

    return undefined;
}
