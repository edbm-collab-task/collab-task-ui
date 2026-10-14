/**
 * Codes binaires des actions, sur le modèle des permissions Unix.
 *
 * Chaque action possède un bit unique et donc une puissance de deux comme
 * code. Les actions accordées pour une permission sont ensuite combinées par
 * un OU binaire (« somme ») afin de ne former qu'un seul entier : c'est ce
 * masque qui est comparé et transmis à l'API.
 *
 * Exemple : `ACT.INSERT | ACT.UPDATE` vaut `1 | 4` = `5`.
 */
export const ACT = {
    /** Créer une ressource. */
    INSERT: 1,
    /** Lire / consulter une ressource. */
    SELECT: 2,
    /** Modifier une ressource existante. */
    UPDATE: 4,
    /** Supprimer une ressource. */
    DELETE: 8,
    /** Générer un rapport. */
    GENERATE_REPORT: 16,
    /** Exporter des données. */
    EXPORT: 32
} as const;

/** Nom d'une action (`INSERT`, `SELECT`, …). */
export type ActionName = keyof typeof ACT;

/** Code binaire d'une action (`ACT.INSERT`, `ACT.SELECT`, …). */
export type ActionCode = (typeof ACT)[keyof typeof ACT];

/**
 * Masque de toutes les actions disponibles, calculé depuis {@link ACT}.
 *
 * Vaut `63` tant que la table compte six actions ; la valeur se met à jour
 * automatiquement dès qu'une action est ajoutée ou retirée.
 */
export const ALL_ACTIONS: number = Object.values(ACT).reduce(
    (mask, code) => mask | code,
    0
);

/**
 * Vérifie qu'une action est incluse dans un masque de permissions.
 *
 * Le test `(mask & action) === action` garantit que le bit de l'action est
 * bien positionné. Un masque `undefined` (donnée non fournie par l'API) ne
 * vaut jamais comme accordé.
 *
 * @param mask   Masque binaire des actions accordées, ou `undefined`.
 * @param action Code de l'action recherchée.
 * @returns `true` si l'action est accordée.
 */
export function hasAction(
    mask: number | undefined,
    action: ActionCode
): boolean {
    if (mask === undefined) return false;
    return (mask & action) === action;
}

/**
 * Reconstruit un masque binaire depuis une liste de noms d'actions.
 *
 * Inverse de {@link hasAction} : convertit une sélection d'interface (cases à
 * cocher) en la valeur entière attendue par l'API.
 *
 * @param actions Noms des actions à combiner (les doublons sont inoffensifs).
 * @returns Le masque binaire correspondant (`0` si la liste est vide).
 */
export function actionsToMask(actions: ActionName[]): number {
    return actions.reduce((mask, action) => mask | ACT[action], 0);
}
