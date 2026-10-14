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

/** Libellés lisibles des actions, alignés sur ceux renvoyés par l'API. */
export const ACTION_LABELS: Record<ActionName, string> = {
    INSERT: "Insérer",
    SELECT: "Voir",
    UPDATE: "Modifier",
    DELETE: "Supprimer",
    GENERATE_REPORT: "Générer un rapport",
    EXPORT: "Exporter"
};

/**
 * Noms des actions dans leur ordre d'affichage (ordre croissant des codes).
 *
 * Dérivé de {@link ACT} : l'ordre d'insertion de l'objet suit les codes, un
 * ajout d'action se répercute donc sans intervention.
 */
export const ACTION_NAMES: ActionName[] = Object.keys(ACT) as ActionName[];

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

/**
 * Décompose un masque binaire en la liste des actions qu'il contient.
 *
 * Inverse de {@link actionsToMask} : sert à reconstruire les cases à cocher
 * d'une permission à partir de `totalActions` (actions possibles) ou de
 * `totalActionsAccordees` (actions accordées) renvoyés par l'API.
 *
 * @param mask Masque binaire, ou `undefined` (donnée non fournie).
 * @returns Les noms des actions présentes, dans l'ordre de {@link ACTION_NAMES}.
 */
export function maskToActions(mask: number | undefined): ActionName[] {
    return ACTION_NAMES.filter((name) => hasAction(mask, ACT[name]));
}
