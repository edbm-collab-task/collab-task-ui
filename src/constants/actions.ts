/**
 * Catalogue des actions (codes binaires), sur le modèle des permissions Unix.
 *
 * Les codes ne sont **jamais écrits à la main** : le fichier ne déclare que
 * la liste des noms (`ACTION_NAMES`, clés de `ACT`). Les valeurs sont
 * hydratées au démarrage depuis `GET /roles/actions` (table de conversion
 * backend) par {@link hydrateActionCatalog}, qui associe chaque nom au
 * `codeAction` renvoyé par l'API — la comparaison se fait sur le nom
 * (plain text), l'ordre de la réponse n'a aucune importance.
 *
 * Tant que l'API n'a pas répondu (ou en cas d'échec), les codes restent à
 * `0` : aucune action n'est alors détectée dans les masques (fail-closed).
 *
 * Les actions accordées pour une permission sont combinées par un OU
 * binaire (« somme ») afin de ne former qu'un seul entier : c'est ce masque
 * qui est comparé et transmis à l'API.
 */

/**
 * Liste statique des noms d'actions — sert de référence pour les clés de
 * {@link ACT} et d'ordre d'affichage dans l'UI.
 */
export const ACTION_NAMES = [
    "INSERT",
    "SELECT",
    "UPDATE",
    "DELETE",
    "EXPORT",
    "DOWNLOAD",
    "ARCHIVE"
] as const;

    /**
     * Nom de l'action exigée sur la permission (`"INSERT"`, `"SELECT"`,
     * `"UPDATE"`, …).
     *
     * On passe le nom et non `ACT.*` : le routeur est évalué avant
     * l'hydratation du catalogue, la valeur serait figée à 0. Le nom est
     * résolu en code au moment du test, comme dans `AdminMenu`.
     */
export type ActionName = (typeof ACTION_NAMES)[number];

/**
 * Code binaire d'une action — **fourni par le backend**, jamais écrit à la
 * main. Typé `number` car la valeur n'est connue qu'après hydration.
 */
export type ActionCode = number;

/**
 * Codes binaires des actions, indexés par nom.
 *
 * Les clés sont statiques (autocomplete `ACT.INSERT`, `ACT.SELECT`, …) ; les
 * valeurs sont remplies par {@link hydrateActionCatalog} depuis le catalogue
 * backend. Muté **sur place** : la référence objet reste la même, les ~24
 * fichiers importeurs continuent de fonctionner sans changement.
 */
export const ACT: Record<ActionName, number> = Object.fromEntries(
    ACTION_NAMES.map((name) => [name, 0])
) as Record<ActionName, number>;

/** Libellés lisibles des actions, remplis depuis le catalogue backend. */
export const ACTION_LABELS: Record<string, string> = {};

/**
 * Masque de toutes les actions disponibles, recalculé par
 * {@link hydrateActionCatalog} (OU binaire de tous les codes reçus).
 */
export let ALL_ACTIONS = 0;

/**
 * Entrée du catalogue backend (`ActionResDto`, `GET /roles/actions`).
 */
export interface ActionCatalogEntry {
    /** Nom technique de l'action (`INSERT`, `SELECT`, …). */
    name: string;
    /** Code binaire attribué par le backend. */
    codeAction: number;
    /** Libellé lisible, affiché dans l'UI. */
    label: string;
}

/**
 * Remplit le catalogue ({@link ACT}, {@link ACTION_LABELS},
 * {@link ALL_ACTIONS}) depuis la réponse de `GET /roles/actions`.
 *
 * Chaque entrée est appariée à `ACT` **par nom** (plain text) : si l'ordre
 * ou le nombre d'actions diffère côté backend, seuls les noms comptent. Les
 * noms inconnus du front sont ajoutés à `ACT` afin de rester décodables
 * dans les masques (`maskToActions`).
 *
 * En cas d'échec de l'appel, ne rien faire : les codes restent à `0`
 * (fail-closed, aucun élément permissionné n'est affiché).
 *
 * @param catalog Table de conversion nom → code binaire + libellé.
 */
export function hydrateActionCatalog(catalog: ActionCatalogEntry[]): void {
    if (!Array.isArray(catalog) || catalog.length === 0) return;

    const act = ACT as Record<string, number>;
    let mask = 0;

    for (const name of Object.keys(act)) act[name] = 0;
    for (const label of Object.keys(ACTION_LABELS)) delete ACTION_LABELS[label];
    for (const { name, codeAction, label } of catalog) {
        act[name] = codeAction;
        ACTION_LABELS[name] = label;
        mask |= codeAction;
    }

    ALL_ACTIONS = mask;
}

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
    if (action === 0) return false;
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
 * Parcourt {@link ACTION_NAMES} puis les éventuels noms ajoutés par
 * l'hydration ({@link hydrateActionCatalog}) : une action connue du backend
 * mais pas du front reste décodable.
 *
 * @param mask Masque binaire, ou `undefined` (donnée non fournie).
 * @returns Les noms des actions présentes, dans l'ordre de {@link ACTION_NAMES}.
 */
export function maskToActions(mask: number | undefined): ActionName[] {
    const known: string[] = [...ACTION_NAMES];
    const act = ACT as Record<string, number>;
    const extra = Object.keys(act).filter((name) => !known.includes(name));
    return [...known, ...extra].filter((name) =>
        hasAction(mask, act[name])
    ) as ActionName[];
}


export const ACTN = Object.fromEntries(
    ACTION_NAMES.map((name) => [name, name])
) as { [K in ActionName]: K };