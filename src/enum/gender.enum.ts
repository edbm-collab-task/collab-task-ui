export const Gender = {
    MALE: "M",
    FEMALE: "F"
} as const;


export type Gender =
    typeof Gender[keyof typeof Gender];