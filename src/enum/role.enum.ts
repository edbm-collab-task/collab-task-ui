export const RoleType = {
    USER: "U1S",
    ADMIN: "A1D",
    SUPER_ADMIN: "S1ADM"
} as const;

/**
 * Codes réservés aux rôles système : ils ne peuvent être réattribués ni
 * générés automatiquement pour un rôle créé depuis l'interface. Dérivé de
 * `RoleType` pour rester aligné si un jour un rôle système est ajouté.
 */
export const RESERVED_ROLE_CODES: readonly string[] = Object.values(RoleType);

export type RoleTypeCode = (typeof RoleType)[keyof typeof RoleType];

export type RoleName = keyof typeof RoleType;